import { InventoryTxnType } from "@prisma/client";
import { getInventoryTransactionsRepo, getInventoryWithTransactionsRepo, postInventoryTransactionRepo } from "../repository/inventory.repository";
import { GetInventoryProductType, GetInventoryProductWithTransactionsType, GetInventoryTransactionsType, PostInventoryTransactionType, WarehouseIdType } from "../validation/inventory.validation"
import prisma from "../../../utils/prisma";

export const getInventoryStockService = async ({warehouseId}:WarehouseIdType) => {
    const products = await prisma.warehouseInventory.findMany({
      where: {
        warehouseId: warehouseId,
      },
      include: {
        product: {
          select: {
            description: true,
            brand: true,
            family: true,
            type: true,
          },
        },
      },
    });
    return {
        products, 
        message: 'WarehouseInventory fetched successfully.'
    } 
}


export const getInventoryProductService = async ({warehouseId,productMn}:GetInventoryProductType) => {

    const inventoryProduct = await prisma.warehouseInventory.findUnique({
      where: {
        warehouseId_productMn: {
          warehouseId: warehouseId,
          productMn: productMn,
        },
      },
    });

    return { inventoryProduct, message: 'WarehouseInventory fetched successfully.' }
}


export const getInventoryProductWithTransactionsService = async ({warehouseId, productMn, page, limit} : GetInventoryProductWithTransactionsType) => {
    
    const [inventoryProduct, inventoryTransactions, totalCount] =
      await getInventoryWithTransactionsRepo({
        warehouseId: warehouseId,
        productMn: productMn,
        page: page,
        limit: limit,
      });

    return {
      inventoryProduct,
      inventoryTransactions,
      totalPages: totalCount === 0 ? 1 : Math.ceil(totalCount / limit),
      message: "WarehouseInventory with transactions fetched successfully.",
    };

}


export type PostInventoryTransactionServiceType = PostInventoryTransactionType & {
    createdBy: string | null
}

export const postInventoryTransactionService = async ({productMn,warehouseId,type,qty,adjSign,reference, createdBy}:PostInventoryTransactionServiceType) => {

    const response = await postInventoryTransactionRepo({
        productMn,warehouseId,type,qty,adjSign,reference, createdBy
    })

    return {
        updatedInventoryProduct: response.updateWarehouseInventory,
        createdTransaction: response.createdTransaction ,
        message: 'WarehouseInventory with transactions fetched successfully.'
    }

}


export const getInventoryTransactionsService = async ({warehouseId, search, txnType, dateFrom, dateTo, page, limit }:GetInventoryTransactionsType) => {
        
        const [ inventoryTransactions, totalCount ] = await getInventoryTransactionsRepo({
            warehouseId, 
            search, 
            txnType, 
            dateFrom, 
            dateTo, 
            page, 
            limit
        })
        console.log("Total count: ", totalCount);

        return { 
            inventoryTransactions, 
            totalPages: totalCount===0 ? 1 : Math.ceil(totalCount/limit),
            message: 'InventoryTransaction fetched successfully.'
        }
}