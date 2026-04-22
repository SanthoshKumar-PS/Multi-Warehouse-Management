import prisma from '../../../utils/prisma'
import { NewPurchaseType, GetPurchaseOrderByNumberType, GetPurchaseOrdersType, ReceiveTransferItemsType } from '../validation/purchase.validate'
import getPurchaseDate from '../utils/getPurchaseDate';
import { getNextFormattedPurchaseNumber } from '../utils/getNextFormattedPurchaseNumber'
import ApiError from '../../../utils/ApiError';
import { InventoryTxnType, Prisma, PurchaseStatusType } from '@prisma/client'
import { applyInventoryTxn } from '../../inventory/domain/applyInventoryTxn';

export const getPurchaseOrdersService = async ({warehouseId, search, statusFilter, page, limit} : GetPurchaseOrdersType) => {
    const skip = (page-1)*limit;

    const whereClause: Prisma.PurchaseOrderWhereInput = {
        warehouseId: warehouseId
    }

    if(search){
        whereClause.OR = [
            {
                poNumber: {
                    contains: search
                }
            },
            {
                supplierName: {
                    contains: search                }
            },
            {
                items:{
                    some: {
                        productMn: {
                            contains: search
                        }
                    }
                }
            }
        ]
    }

    if(statusFilter!=='ALL'){
        whereClause.status = {
            equals: statusFilter
        }
    }

    const purchaseOrderPromise = prisma.purchaseOrder.findMany({
        where:{
            ...whereClause
        },
        include: {
            items: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: limit,
        skip
    });

    const totalRowsPromise = prisma.purchaseOrder.count({
        where:{
            ...whereClause
        }
    });


    const [purchaseOrders, totalRows] = await Promise.all([
        purchaseOrderPromise,
        totalRowsPromise
    ]);

    console.log("totalRows: ",totalRows);

    return { purchaseOrders, totalRows }
}


type createNewPurchaseOrderServiceType  = NewPurchaseType & {
    createdBy: string | null
}
export const createNewPurchaseOrderService = async ({poOrderItems, supplierId,expectedDate, orderNotes, warehouseId, warehouseName,createdBy}: createNewPurchaseOrderServiceType) => {
    const response = await prisma.$transaction(async (tx) => {
        // Generate Vr2 Date
        let newPurchaseNo
        const vr2PurchaseDate = getPurchaseDate();
        const formattedNumber = await getNextFormattedPurchaseNumber(tx, vr2PurchaseDate);
        newPurchaseNo = `${vr2PurchaseDate}-${formattedNumber}`;
        console.log("newPurchaseNo: ",newPurchaseNo);

        if (poOrderItems.length === 0) {
            throw new ApiError(400, "No items provided");
        }
        
        const supplier = await tx.supplier.findUnique({
            where:{
                id: supplierId
            }
        })
        if(!supplier){
            console.log("Supplier not found for provided supplierid");
            throw new ApiError(404, "Supplier not found.")
        }

        const products = await tx.product.findMany({
            where: {
                mn: { in: poOrderItems.map(po => po.productMn) }
            },
            select: { mn:true }
        })
        const validMns = new Set(products.map(p => p.mn))
        for (const prod of poOrderItems){
            if(!validMns.has(prod.productMn)){
                console.log("Product MN not found in product table.");
                throw new ApiError(400, `Invalid product: ${prod.productMn}`);
            }
        }
        const uniqueMns = new Set(poOrderItems.map(p => p.productMn));
        if (uniqueMns.size !== poOrderItems.length) {
            throw new ApiError(400, "Duplicate products not allowed");
        }

        const purchaseOrder = await tx.purchaseOrder.create({
            data: {
                poNumber: newPurchaseNo,
                warehouseId: warehouseId,
                warehouseName: warehouseName,
                supplierId: supplier.id,
                supplierName: supplier.name,
                status: PurchaseStatusType.CREATED,
                expectedDate: new Date(expectedDate),
                createdBy: createdBy??"UNKNOWN",
                remarks: orderNotes
            }
        })

        let purchaseOrderItemsData: Prisma.PurchaseOrderItemCreateManyInput[] = [];
        purchaseOrderItemsData = poOrderItems.map(prod => ({
            purchaseOrderId: purchaseOrder.id,
            productMn: prod.productMn,
            orderedQty: prod.orderedQty
        }))

        await tx.purchaseOrderItem.createMany({
            data: purchaseOrderItemsData
        })

        return {purchaseOrder}
    })

    return {purchaseOrder: response.purchaseOrder}
}


export const getPurchaseOrderByNumberService = async ({ warehouseId, poNumber } : GetPurchaseOrderByNumberType) => {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where:{
            poNumber: poNumber
        },
        include: {
            items: {
                include: {
                    product:{
                        select:{
                            description:true
                        }
                    }
                }
            },
            supplier: {
                select: {
                    phone: true
                }
            }
        }
    })

    console.log("purchaseOrder: ",purchaseOrder);
    return { purchaseOrder }

}