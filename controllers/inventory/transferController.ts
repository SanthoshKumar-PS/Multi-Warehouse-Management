import { Prisma, PrismaClient, InventoryTxnType, WarehouseAccessType, TransferItem } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../../utils/AuthRequest";
import { validateInventoryTransaction } from '../../validations/validateInventoryTxn'
import { calculateInventoryInputs } from '../../validations/calculateInventoryInputs'
import ApiError from '../../utils/ApiError';
import getTransferDate from './utils/getTransferDate';
import {getNextFormattedTransferNumber} from './utils/getNextFormattedTransferNumber'
import { deriveQtyChangeFromTxnType } from "../../validations/deriveQtyChangeFromTxnType";
import { applyInventoryTxn } from '../../services/applyInventoryTxn';
import { isTransferStatus } from '../../validations/enumValidations/isTransferStatus'
const prisma = new PrismaClient();

type SelectedProductType = {
    productMn: string,
    description: string,
    availableQty: number,
    qty:number
}
type FromToWarehouseType = {
    warehouseId: number,
    warehouseName: string,
    warehouseLocation: string,
    accessType: WarehouseAccessType
}
export const createNewTransfer = async(req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        console.log("Req query params: ", req.query);
        const { selectedProducts, fromWarehouse, toWarehouse } = req.body as {
            selectedProducts: SelectedProductType[], 
            fromWarehouse: FromToWarehouseType, 
            toWarehouse: FromToWarehouseType
        }
        console.log("SelectedProducts: ",selectedProducts);
        console.log("From warehouse: ",fromWarehouse);
        console.log("To warehouse: ",toWarehouse);
        if(!fromWarehouse || !toWarehouse || !selectedProducts || selectedProducts.length === 0){
            console.log("Missing required details for transfers.");
            return res.status(400).json({ message: 'Missing warehouse details or products to transfer.' })
        }

        if(fromWarehouse.warehouseId === toWarehouse.warehouseId){
            console.log("Source and destination warehouses must be different.");
            return res.status(400).json({message:'Source and destination warehouses must be different.'})
        }

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
                    createdBy: authUser?.trigram
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
                            warehouseId: Number(fromWarehouse.warehouseId)

                        },
                    },
                    data:{
                            physicalQty: newPhysical,
                            reservedQty: newReserved
                        }
                });

                inventoryTransactionsData.push({
                    warehouseId:fromWarehouse.warehouseId,
                    productMn:prod.productMn,
                    qtyChange:prod.qty,
                    type:'RESERVE',
                    reference: newTransferNo,
                    createdBy:authUser?.trigram ?? null,
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


        return res.status(200).json({message: 'Successfully created', transferNo: response.transferOrder.transferNo})

        
    } catch (error:any) {
        if(error instanceof ApiError){
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.log('Error occured in createNewTransfer: ', error);
        return res.status(500).json({ message:'Internal Server Error.' });        
    }
}

export const dispatchTransferItems = async(req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        const createdBy =authUser?.trigram ?? null

        console.log("Req query params: ", req.query);
        console.log("Req body params: ", req.body);
        const { selectedWarehouseId } = req.query;
        const { fromWarehouseId, transferNo, dispatchTransferItems=[] } = req.body as {
            fromWarehouseId: number,
            transferNo: string,
            dispatchTransferItems: TransferItem[]
        };
        
        if(!selectedWarehouseId || !fromWarehouseId || !transferNo || typeof(transferNo)!=='string' || dispatchTransferItems.length===0){
            console.log("Missing required details to dispatch transfers.");
            return res.status(400).json({ message: 'Missing warehouse details or dispatch items to dispatch transfers.' })
        }

        if(fromWarehouseId!==Number(selectedWarehouseId)) {
            console.log("Selected Warehouse Id and From Warehouse Id differs.");
            return res.status(400).json({ message: 'Selected Warehouse Id and From Warehouse Id differs.' })
        }

        // TODO: Add array to store InventoryTransactions and use createMany to do it at once
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

            const transferOrder = await tx.transferOrder.update({
                where:{
                    transferNo:transferNo
                },
                data:{
                    status:'DISPATCHED'
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
        return res.status(200).json({message: 'Transfer dispatched successfully.', transferOrder:response.transferOrder, inventoryTransactions })

        
    } catch (error:any) {
        console.log('Error occured in dispatchTransferItems: ', error);
        return res.status(500).json({ message:'Internal Server Error.' });        
    }
}

export const getTransfers = async(req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        console.log("Req query params: ", req.query);
        const { selectedWarehouseId, debouncedSearch, statusFilter, directionFilter, page, limit } = req.query;
        const search = typeof(debouncedSearch)==='string' ? debouncedSearch.trim() :undefined

        const pageNo = Number(page);
        const limitNo = Number(limit);
        const skip = (pageNo-1)*limitNo;
        
        if(!selectedWarehouseId){
            console.log("Missing required details to fetch transfers.");
            return res.status(400).json({ message: 'Missing warehouse details to fetch transfers.' })
        }

        const whereClause: Prisma.TransferOrderWhereInput = {
            OR:[
                {fromWarehouseId:Number(selectedWarehouseId)},
                {toWarehouseId: Number(selectedWarehouseId)}
            ]
        }

        if(search){
            whereClause.OR = [
                {
                    transferNo:{
                        contains: search
                    }
                },
                {
                    fromWarehouseName:{
                        contains: search
                    }
                },
                {
                    toWarehouseName: {
                        contains: search
                    }
                },
            ]
        }

        if(typeof(statusFilter)==='string' && statusFilter!=='ALL' && isTransferStatus(statusFilter)){
            whereClause.status = {
                equals: statusFilter 
            }
        }

        if(typeof(directionFilter)==='string' && ['INBOUND', 'OUTBOUND'].includes(directionFilter)){
            if(directionFilter === 'INBOUND'){
                whereClause.toWarehouseId = Number(selectedWarehouseId)
            } else if(directionFilter === 'OUTBOUND'){
                whereClause.fromWarehouseId = Number(selectedWarehouseId)
            }
        }

        const transferOrdersPromise = prisma.transferOrder.findMany({
            where:{
                ...whereClause
            },
            include:{
                items:true
            },
            orderBy:{
                createdAt:'desc'
            },
            take:limitNo,
            skip
        }) 

        const totalRowsPromise = prisma.transferOrder.count({
            where:{
                ...whereClause
            }
        })

        const [transferOrders, totalRows] = await Promise.all([
            transferOrdersPromise,
            totalRowsPromise
        ])

        console.log("totalRows: ",totalRows);



        return res.status(200).json({
            transferOrders,
            totalPages: totalRows===0 ? 1 : Math.ceil(totalRows/limitNo),
            message: 'Successfully fetched transfers.'
        })

        
    } catch (error:any) {
        console.log('Error occured in getTransfers: ', error);
        return res.status(500).json({ message:'Internal Server Error.' });        
    }
}

export const getTransferByTransferNo = async(req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        console.log("Req query query: ", req.query);
        console.log("Req query params: ", req.params);
        const { selectedWarehouseId } = req.query;
        const { transferNo } = req.params;
        
        if(!selectedWarehouseId || !transferNo || typeof(transferNo)!=='string'){
            console.log("Missing required details to fetch transfer.");
            return res.status(400).json({ message: 'Missing warehouse details or transferNo to fetch transfer.' })
        }

        const transfer = await prisma.transferOrder.findUnique({
            where:{
                transferNo: transferNo
            },
            include: {
                items: true
            }
        });

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

        console.log("Inventory Transactions for transfer: ",inventoryTransactions);

        console.log("Transfer data: ",transfer);

        return res.status(200).json({message: 'Successfully fetched transfers.', transfer, inventoryTransactions })

        
    } catch (error:any) {
        console.log('Error occured in getTransfers: ', error);
        return res.status(500).json({ message:'Internal Server Error.' });        
    }
}