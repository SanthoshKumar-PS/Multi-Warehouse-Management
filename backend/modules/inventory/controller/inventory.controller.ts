import { Request, Response } from "express";
import { AuthRequest } from "../../../utils/AuthRequest";
import { loginTrigramService } from "../services/auth.service";
import { getInventoryProductService, getInventoryProductWithTransactionsService, getInventoryStockService, getInventoryTransactionsService, getProductAvailabilityService, postInventoryTransactionService } from "../services/inventory.service";
import { validateRequest } from '../../../utils/validateRequest'
import { loginSchema } from "../validation/auth.validate";
import { GetInventoryProductSchema, GetInventoryProductWithTransactionsSchema, GetInventoryTransactionsSchema, GetProductAvailabilitySchema, PostInventoryTransactionSchema, WarehouseSchema } from "../validation/inventory.validation";
import prisma from "../../../utils/prisma";

export const loginWarehouseTrigram = async(req:Request, res:Response) => {
    try {
        const validated = validateRequest(loginSchema, {
            body:req.body
        })
        const { trigram, password} = validated.body;
        console.log("Req body recieved: ", trigram, password);
        const result = await loginTrigramService({trigram,password})
        return res.status(200).json(result);
    } catch (error:any) {
        console.log("Error occured in loginWarehouseTrigram: ", error);
        return res.status(error.statusCode || 500).json({message:error.message || 'Internal Server Error'})  
    }
}

export const getInventoryStock = async(req:AuthRequest, res:Response) => {
    try {
        console.log("Req query params: ", req.query);
        const validated = validateRequest(WarehouseSchema,{
            query:req.query
        });
        const { warehouseId } = validated.query

        const result = await getInventoryStockService({warehouseId: warehouseId})

        return res.status(200).json(result);
        
    } catch (error:any) {
        console.log('Error occured in getInventoryStock: ', error);
        return res.status(error.statusCode || 500).json({message:error.message || 'Internal Server Error'})    
    }
}

export const getInventoryProduct = async(req:AuthRequest, res:Response) => {
    try {
        const validated = validateRequest(GetInventoryProductSchema,{
            query:req.query
        })
        const { warehouseId, productMn } = validated.query;
        console.log("Req query params: ", req.query);

        const result = await getInventoryProductService({warehouseId:warehouseId, productMn:String(productMn)})

        return res.status(200).json(result);
        
    } catch (error:any) {
        console.log('Error occured in getInventoryProduct: ', error);
        return res.status(error.statusCode || 500).json({message:error.message || 'Internal Server Error'})      
    }
}

export const getProductAvailability = async(req:AuthRequest, res:Response) => {
    try {
        console.log("Req params: ", req.params);
        const validated = validateRequest(GetProductAvailabilitySchema,{
            params:req.params
        })
        const { productMn } = validated.params;
        
        const result = await getProductAvailabilityService({productMn});

        return res.status(200).json({stockAvailable: result});
        
    } catch (error:any) {
        console.log('Error occured in getInventoryProduct: ', error);
        return res.status(error.statusCode || 500).json({message:error.message || 'Internal Server Error'})      
    }
}



export const getInventoryProductWithTransactions = async(req:AuthRequest, res:Response) => {
    try {
        const validated = validateRequest(GetInventoryProductWithTransactionsSchema,{
            query: req.query
        })
        const { warehouseId, productMn, page, limit } = validated.query;
        console.log("Req query params: ", req.query);
        
        const result = await getInventoryProductWithTransactionsService({
            warehouseId,
            productMn,
            page,
            limit
        })

        return res.status(200).json(result);
        
    } catch (error:any) {
        console.log('Error occured in getInventoryProductWithTransactions: ', error);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error.' });        
    }
}


export const postInventoryTransaction = async(req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        console.log("Req query params: ", req.query);
        console.log("Req body: ", req.body);

        const validated = validateRequest(PostInventoryTransactionSchema,{
            query: req.query,
            body: req.body
        })
        const {productMn,warehouseId, warehouseName,type,qty,adjSign,reference} = validated;

        const result = await postInventoryTransactionService({
            productMn,
            warehouseId,
            warehouseName,
            type,
            qty,
            adjSign,
            reference,
            createdBy: authUser?.trigram ?? null
        })
        // console.log("Transacion response: ", response);

        return res.status(200).json(result)
        
    } catch (error:any) {
        console.log('Error occured in postInventoryTransaction: ', error);
        return res.status(error.statusCode || 500).json({ message:error.message || 'Internal Server Error.' });        
    }
}


export const getInventoryTransactions = async(req:AuthRequest, res:Response) => {
    try {
        console.log("Req query params: ",req.query);

        const validated = validateRequest(GetInventoryTransactionsSchema, {
            query: req.query
        })
        
        const { warehouseId, search, txnType, dateFrom, dateTo, page, limit } = validated.query;

        console.log(`Page: ${page} limit:${limit}`);

        const result = await getInventoryTransactionsService({
            warehouseId,
            search,
            txnType,
            dateFrom,
            dateTo,
            page,
            limit
        })

        console.log("Req query params: ", req.query);

        return res.status(200).json(result)
        
    } catch (error:any) {
        console.log('Error occured in getInventoryProduct: ', error);
        return res.status(error.statusCode || 500).json({ message:error.message || 'Internal Server Error.' });        
    }
}
