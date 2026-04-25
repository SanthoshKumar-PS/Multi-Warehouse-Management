import prisma from "../../../utils/prisma";
import getTransferDate from "../utils/getTransferDate";
import { getNextFormattedTransferNumber } from "../utils/getNextFormattedTransferNumber";
import {deriveQtyChangeFromTxnType} from '../../inventory/domain/deriveQtyChangeFromTxnType';
import { validateInventoryTransaction } from '../../inventory/domain/validateInventoryTxn';
import { calculateInventoryInputs } from '../../inventory/domain/calculateInventoryInputs';
import { DispatchTransferItemsType, NewTransferType, GetTransfersType, GetTransferByTransferNoType, ReceiveTransferItemsType, CancelTransferItemsType } from "../validation/transfer.validate";
import { InventoryTxnType, Prisma } from "@prisma/client";
import ApiError from "../../../utils/ApiError";
import { applyInventoryTxn } from "../../inventory/domain/applyInventoryTxn";

type CreateNewTransferServiceType = NewTransferType & {
  createdBy: string | null
}
export const createNewTransferService = async ({selectedProducts, fromWarehouse, toWarehouse, createdBy}: CreateNewTransferServiceType) => {
        const response = await prisma.$transaction(async (tx) => {
            
            // Generate Vr2 Date
            let newTransferNo
            const vr2TransferDate = getTransferDate();
            const formattedNumber = await getNextFormattedTransferNumber(tx, vr2TransferDate);
            newTransferNo = `${vr2TransferDate}-${formattedNumber}`;
            console.log("newTransferNo: ",newTransferNo);

            const transferOrder = await tx.transferOrder.create({
                data:{
                    transferNo: newTransferNo,
                    fromWarehouseId: fromWarehouse.warehouseId,
                    toWarehouseId: toWarehouse.warehouseId,
                    fromWarehouseName:fromWarehouse.warehouseName,
                    toWarehouseName:toWarehouse.warehouseName,
                    status: 'CREATED',
                    createdBy: createdBy
            }});

            const transferItemsData: Prisma.TransferItemCreateManyInput[] = [];
            const inventoryTransactionsData: Prisma.InventoryTransactionCreateManyInput[] = [];

            const productMns = [...new Set(selectedProducts.map(p=> p.productMn))]
            const inventories = await tx.warehouseInventory.findMany({
                where:{
                    warehouseId:Number(fromWarehouse.warehouseId),
                    productMn: {
                        in: productMns
                    }
                }
            })

            if(inventories.length !== productMns.length){
                console.log("Length of productMns and inventories are not equal. Something is missing.");
                throw new ApiError(404,"Some products not found in warehouse inventory")
            }

            const inventoryMap = new Map(
                inventories.map(inv => [inv.productMn, inv])
            )

            console.log("Inventories Map: ",inventoryMap);

            for(const prod of selectedProducts){
                await tx.$queryRaw`
                SELECT * FROM WarehouseInventory
                WHERE productMn = ${prod.productMn}
                AND warehouseId = ${Number(fromWarehouse.warehouseId)}
                FOR UPDATE
                `

                const warehouseInventory = inventoryMap.get(prod.productMn)

                if(!warehouseInventory){
                    throw new ApiError(404, `Product ${prod.productMn} not found in warehouse`);
                }

                const qtyChange = deriveQtyChangeFromTxnType('RESERVE',prod.qty)
                
                const validation = validateInventoryTransaction( {
                    type:InventoryTxnType.RESERVE,
                    qtyChange: qtyChange,
                    physicalQty:warehouseInventory.physicalQty,
                    reservedQty:warehouseInventory.reservedQty
                });
                console.log("Validation output: ", validation);

                if(!validation.isValid){
                    const availableStock = warehouseInventory.physicalQty - warehouseInventory.reservedQty;
                    console.log("Validation failed: ",validation.error)
                    throw new ApiError(400,`Insufficient stock for ${prod.productMn}. Available: ${availableStock}, Requested: ${qtyChange}`);
                }
                
                const { newPhysical, newReserved } = calculateInventoryInputs(
                    'RESERVE', 
                    warehouseInventory.physicalQty, 
                    warehouseInventory.reservedQty, 
                    Number(prod.qty)
                );

                console.log(`Physical: ${warehouseInventory.physicalQty} newPhysical: ${newPhysical}`);
                console.log(`Reserved: ${warehouseInventory.reservedQty} newReserved: ${newReserved}`);

                const updatedWarehouseInventory = await tx.warehouseInventory.update({
                    where:{
                        warehouseId_productMn:{
                            productMn: prod.productMn,
                            warehouseId: fromWarehouse.warehouseId

                        },
                    },
                    data:{
                            physicalQty: newPhysical,
                            reservedQty: newReserved
                        }
                });

                inventoryTransactionsData.push({
                    warehouseId:fromWarehouse.warehouseId,
                    warehouseName: fromWarehouse.warehouseName,
                    productMn:prod.productMn,
                    qtyChange:prod.qty,
                    type:'RESERVE',
                    reference: newTransferNo,
                    createdBy:createdBy,
                    physicalBefore:warehouseInventory.physicalQty,
                    physicalAfter:newPhysical,
                    reservedBefore:warehouseInventory.reservedQty,
                    reservedAfter:newReserved
                })

                transferItemsData.push({
                    transferId: transferOrder.id,
                    transferNo: transferOrder.transferNo,
                    productMn: warehouseInventory.productMn,
                    requestedQty: prod.qty,
                    dispatchedQty: 0,
                    receivedQty: 0
                }) 

                console.log("Check success, all okay and available for ",warehouseInventory.productMn);
            }

            await tx.inventoryTransaction.createMany({
                data: inventoryTransactionsData
            })
            await tx.transferItem.createMany({
                data: transferItemsData
            })

            return { transferOrder }
        },{
            maxWait:10000,
            timeout:60000
        })


        console.log("Transaction completed successfully");
        console.log("Response to be sent is: ");
        const trasferOrder = await prisma.transferOrder.findFirst({
            orderBy:{
                createdAt:'desc'
            },
            include:{
                items:true
            }
        })
        console.log("Transfer Order: ", trasferOrder);

        return {transferNo: response.transferOrder.transferNo}



}

type DispatchTransferServiceType = DispatchTransferItemsType & {
    createdBy: string | null
}

export const dispatchTransferItemsService = async ({fromWarehouseId, fromWarehouseName,transferNo,dispatchTransferItems, createdBy}: DispatchTransferServiceType) => {
        const response = await prisma.$transaction(async (tx) => {

            const inventoryTransactionsData: Prisma.InventoryTransactionCreateManyInput[] = [];
            const productMns = [...new Set(dispatchTransferItems.map(item => item.productMn))]
            const inventories = await tx.warehouseInventory.findMany({
                where:{
                    warehouseId: fromWarehouseId,
                    productMn: {
                        in: productMns
                    }
                }
            })

            if(inventories.length !== productMns.length){
                throw new ApiError(404,"Some products not found in warehouse inventory")
            }

            const inventoryMap = new Map(
                inventories.map(inv => [inv.productMn,inv])
            )

            for(const item of dispatchTransferItems){
                const dispatchCount = item.dispatchedQty;
                if (dispatchCount > item.requestedQty) {
                    throw new ApiError(400, `Dispatched quantity cannot exceed requested quantity for ${item.productMn}`);
                }
                const releaseCount = item.requestedQty - item.dispatchedQty;
                
                console.log("InventoryMap first: ",inventoryMap);
                const transferOutResult = await applyInventoryTxn(tx, inventoryMap, inventoryTransactionsData, {
                    warehouseId: fromWarehouseId,
                    warehouseName: fromWarehouseName,
                    productMn: item.productMn,
                    type: InventoryTxnType.TRANSFER_OUT,
                    qty: dispatchCount,
                    reference: transferNo,
                    createdBy: createdBy
                })
                const updatedTransferItem = await tx.transferItem.update({
                    where:{
                        transferNo_productMn:{
                            transferNo:transferNo,
                            productMn:item.productMn
                        }
                    },
                    data:{
                        dispatchedQty:dispatchCount
                    }
                });

                if(releaseCount>0){
                    console.log("InventoryMap second: ",inventoryMap);
                    const releaseResult = await applyInventoryTxn(tx, inventoryMap, inventoryTransactionsData, {
                        warehouseId: fromWarehouseId,
                        warehouseName: fromWarehouseName,
                        productMn: item.productMn,
                        type: InventoryTxnType.RELEASE,
                        qty: releaseCount,
                        reference: transferNo,
                        createdBy: createdBy
                    })
                }

            }

            const createdInventoryTransactionsData = await tx.inventoryTransaction.createMany({
                data: inventoryTransactionsData
            });
            console.log("createdInventoryTransactionsData: ",createdInventoryTransactionsData);

            const result = await tx.transferOrder.updateMany({
                where:{
                    transferNo:transferNo,
                    status:'CREATED'
                },
                data:{
                    status:'DISPATCHED'
                }
            });
            if(result.count===0){
                console.log("Transfer order not found or already dispatched");
                throw new ApiError(409, "Transfer order not found or already dispatched.")
            }


            const transferOrder = await tx.transferOrder.findUnique({
                where:{
                    transferNo:transferNo
                },
                include:{
                    items: true
                }
            });
            console.log("UpdatedTransferOrder: ",transferOrder);

            return { transferOrder }
        },{
            maxWait:10000,
            timeout:60000
        })

        const inventoryTransactions = await prisma.inventoryTransaction.findMany({
            where:{
                reference: transferNo
            },
            orderBy:{
                id:'desc'
            },
            include:{
                product:{
                    select:{
                        description:true
                    }
                }
            }
        })

        return { transferOrder: response.transferOrder, inventoryTransactions }
}

type ReceiveTransferItemsServiceType = ReceiveTransferItemsType & {
    createdBy: string | null
}

export const receiveTransferItemsService = async ({ toWarehouseId,toWarehouseName, transferNo, receiveTransferItems, createdBy }: ReceiveTransferItemsServiceType) => {
  const response = await prisma.$transaction(async (tx) => {
    const inventoryTransactionsData: Prisma.InventoryTransactionCreateManyInput[] = [];
    const productMns = [...new Set(receiveTransferItems.map((item) => item.productMn))];
    const inventories = await tx.warehouseInventory.findMany({
      where: {
        warehouseId: toWarehouseId,
        productMn: {
          in: productMns,
        },
      },
    });

    const totalLost = receiveTransferItems.reduce((acc, item) => {
      const lost = item.dispatchedQty - item.receivedQty;
      return acc + (lost > 0 ? lost : 0);
    }, 0);


    const existingMns = new Set(inventories.map((inv) => inv.productMn));
    const missingMns = productMns.filter((mn) => !existingMns.has(mn));

    console.log("Missing products in receiving warehouse: ", missingMns);

    if (missingMns.length > 0) {
      await tx.warehouseInventory.createMany({
        data: missingMns.map((mn) => ({
          warehouseId: toWarehouseId,
          productMn: mn,
          physicalQty: 0,
          reservedQty: 0,
          minimumQty: 10,
        })),
      });
    }

    const updatedInventories = await tx.warehouseInventory.findMany({
      where: {
        warehouseId: toWarehouseId,
        productMn: {
          in: productMns,
        },
      },
    });

    if (updatedInventories.length !== productMns.length) {
      throw new ApiError(404, "Some products not found in warehouse inventory");
    }

    const inventoryMap = new Map(
      updatedInventories.map((inv) => [inv.productMn, inv]),
    );

    for (const item of receiveTransferItems) {
      const receiveCount = item.receivedQty;
      if (receiveCount > item.dispatchedQty) {
        throw new ApiError(
          400,
          `Received quantity cannot exceed dispatched quantity for ${item.productMn}`,
        );
      }
      const lostCount = item.dispatchedQty - item.receivedQty;
          console.log(`Total Lost: ${lostCount} - ${item.productMn}`);


      if(receiveCount>0){
        const receiveResult = await applyInventoryTxn(
          tx,
          inventoryMap,
          inventoryTransactionsData,
          {
            warehouseId: toWarehouseId,
            warehouseName: toWarehouseName,
            productMn: item.productMn,
            type: InventoryTxnType.TRANSFER_IN,
            qty: receiveCount,
            reference: transferNo,
            createdBy: createdBy,
          },
        );
      }
      const updatedTransferItem = await tx.transferItem.update({
        where: {
          transferNo_productMn: {
            transferNo: transferNo,
            productMn: item.productMn,
          },
        },
        data: {
          receivedQty: receiveCount,
        },
      });

      if (lostCount > 0) {
        const warehouseInventory = inventoryMap.get(item.productMn);
        console.log("Updated InventoryMap for lost: ", inventoryMap);
        const lostResult = inventoryTransactionsData.push({
          warehouseId: toWarehouseId,
          warehouseName: toWarehouseName,
          productMn: item.productMn,
          qtyChange: -lostCount,
          type: "LOSS",
          reference: transferNo,
          createdBy: createdBy,
          physicalBefore: warehouseInventory?.physicalQty ?? 0,
          physicalAfter: warehouseInventory?.physicalQty ?? 0,
          reservedBefore: warehouseInventory?.reservedQty ?? 0,
          reservedAfter: warehouseInventory?.reservedQty ?? 0,
        });
      }
    }

    const createdInventoryTransactionsData =
      await tx.inventoryTransaction.createMany({
        data: inventoryTransactionsData,
      });
    console.log(
      "createdInventoryTransactionsData: ",
      createdInventoryTransactionsData,
    );

    const result = await tx.transferOrder.update({
      where: {
        transferNo: transferNo,
        status: "DISPATCHED",
      },
      data: {
        status: totalLost ? "PARTIALLY_RECEIVED" : "COMPLETED",
      },
    });
    if (!result) {
      console.log("Transfer order not found or already received.");
      throw new ApiError(409, "Transfer order not found or already received.");
    }

    const transferOrder = await tx.transferOrder.findUnique({
      where: {
        transferNo: transferNo,
      },
      include: {
        items: true,
      },
    });
    console.log("UpdatedTransferOrder: ", transferOrder);

    return { transferOrder };
  });

  const inventoryTransactions = await prisma.inventoryTransaction.findMany({
    where: {
      reference: transferNo,
    },
    orderBy: {
      id: "desc",
    },
    include: {
      product: {
        select: {
          description: true,
        },
      },
    },
  });

  return { transferOrder: response.transferOrder, inventoryTransactions };
};

type CancelTransferItemsServiceType = CancelTransferItemsType & {
    createdBy: string | null
}
export const cancelTransferItemsService = async ({ fromWarehouseId, fromWarehouseName, transferNo, createdBy }: CancelTransferItemsServiceType) => {
  const response = await prisma.$transaction(async (tx) => {
    const inventoryTransactionsData: Prisma.InventoryTransactionCreateManyInput[] = [];
    const transferOrder = await tx.transferOrder.findUnique({
      where:{
        transferNo: transferNo,
      },
      include:{
        items: true
      }
    })
    if (!transferOrder || transferOrder.status !== 'CREATED') {
      throw new ApiError(400, "Only CREATED transfers can be cancelled");
    }

    const cancelTransferItems = transferOrder.items
    if (cancelTransferItems.length === 0) {
      throw new ApiError(400, "No items found to cancel");
    }
    const productMns = [...new Set(cancelTransferItems.map((item) => item.productMn))];
    const inventories = await tx.warehouseInventory.findMany({
      where: {
        warehouseId: fromWarehouseId,
        productMn: {
          in: productMns,
        },
      },
    });
    
    if(inventories.length !== productMns.length){
      console.log("Length of productMns and inventories are not equal. Something is missing.");
      throw new ApiError(404,"Some products not found in warehouse inventory")
    }

    const inventoryMap = new Map(
      inventories.map((inv) => [inv.productMn, inv]),
    );

    for (const item of cancelTransferItems) {

      const cancelResult = await applyInventoryTxn(
        tx,
        inventoryMap,
        inventoryTransactionsData,
        {
          warehouseId: fromWarehouseId,
          warehouseName: fromWarehouseName,
          productMn: item.productMn,
          type: InventoryTxnType.RELEASE,
          qty: item.requestedQty,
          reference: transferNo,
          createdBy: createdBy,
        },
      );
      const updatedTransferItem = await tx.transferItem.update({
        where: {
          transferNo_productMn: {
            transferNo: transferNo,
            productMn: item.productMn,
          },
        },
        data: {
          dispatchedQty: 0,
          receivedQty: 0
        },
      });

    }

    const createdInventoryTransactionsData = await tx.inventoryTransaction.createMany({
        data: inventoryTransactionsData,
    });
    console.log("createdInventoryTransactionsData: ", createdInventoryTransactionsData );

    const result = await tx.transferOrder.update({
      where: {
        transferNo: transferNo,
        status: 'CREATED',
      },
      data: {
        status: 'CANCELLED'
      }
    });
    if (!result) {
      console.log("Transfer order not found or already received.");
      throw new ApiError(409, "Transfer order not found or already received.");
    }

    const updatedTransferOrder = await tx.transferOrder.findUnique({
      where: {
        transferNo: transferNo,
      },
      include: {
        items: true,
      },
    });
    console.log("UpdatedTransferOrder: ", updatedTransferOrder);

    return { transferOrder: updatedTransferOrder };
  });

  const inventoryTransactions = await prisma.inventoryTransaction.findMany({
    where: {
      reference: transferNo,
    },
    orderBy: {
      id: "desc",
    },
    include: {
      product: {
        select: {
          description: true,
        },
      },
    },
  });

  return { transferOrder: response.transferOrder, inventoryTransactions };
};


export const GetTransfersService = async ({warehouseId, statusFilter, page, limit, search, directionFilter}: GetTransfersType) => {
        const skip = (page - 1) * limit;

        const whereClause: Prisma.TransferOrderWhereInput = {
          OR: [
            { fromWarehouseId: Number(warehouseId) },
            { toWarehouseId: Number(warehouseId) },
          ],
        };

        if (search) {
          whereClause.OR = [
            {
              transferNo: {
                contains: search,
              },
            },
            {
              fromWarehouseName: {
                contains: search,
              },
            },
            {
              toWarehouseName: {
                contains: search,
              },
            },
          ];
        }

        if (statusFilter !== "ALL") {
          whereClause.status = {
            equals: statusFilter,
          };
        }

        if (directionFilter && directionFilter!=='ALL' && ["INBOUND", "OUTBOUND"].includes(directionFilter)
        ) {
          if (directionFilter === "INBOUND") {
            whereClause.toWarehouseId = Number(warehouseId);
          } else if (directionFilter === "OUTBOUND") {
            whereClause.fromWarehouseId = Number(warehouseId);
          }
        }

        const transferOrdersPromise = prisma.transferOrder.findMany({
          where: {
            ...whereClause,
          },
          include: {
            items: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip,
        });

        const totalRowsPromise = prisma.transferOrder.count({
          where: {
            ...whereClause,
          },
        });

        const [transferOrders, totalRows] = await Promise.all([
          transferOrdersPromise,
          totalRowsPromise,
        ]);

        console.log("totalRows: ", totalRows);
        
        return {transferOrders, totalRows}
}


export const GetTransferByTransferNoService = async ({warehouseId,transferNo}:GetTransferByTransferNoType) => {
        const transfer = await prisma.transferOrder.findUnique({
          where: {
            transferNo: transferNo,
          },
          include: {
            items: true,
          },
        });

        // TODO: Correct Orderby according to the requirement - previously it was id : 'desc'
        const inventoryTransactions = await prisma.inventoryTransaction.findMany({
            where: {
              reference: transferNo,
            },
            orderBy: [
              { productMn: 'desc' },
              { id: "asc" }
            ],
            include: {
              product: {
                select: {
                  description: true,
                },
              },
            },
        });

        console.log("Inventory Transactions for transfer: ",inventoryTransactions);

        console.log("Transfer data: ", transfer);

        return { transfer, inventoryTransactions}
}