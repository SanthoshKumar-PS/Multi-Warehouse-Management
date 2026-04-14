import { AuthRequest } from "../../../utils/AuthRequest";
import { Response } from "express";
import prisma from '../../../utils/prisma';
import { InventoryTxnType, Prisma } from "@prisma/client";
import ApiError from '../../../utils/ApiError';

import { CancelTransferItemsSchema, DispatchTransferItemsSchema, GetTransferByTransferNoSchema, GetTransfersSchema, NewTransferSchema, ReceiveTransferItemsSchema, TransferItemType } from "../validation/transfer.validate";
import { validateRequest } from '../../../utils/validateRequest';
import { cancelTransferItemsService, createNewTransferService, dispatchTransferItemsService, GetTransferByTransferNoService, GetTransfersService, receiveTransferItemsService } from "../services/transfer.service";
import { applyInventoryTxn } from '../../inventory/domain/applyInventoryTxn'

export const createNewTransfer = async(req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        console.log("Req query params: ", req.query);
        console.log("Req body : ", req.body);
        const validated = validateRequest(NewTransferSchema,{
            body: req.body
        })
        const { selectedProducts, fromWarehouse, toWarehouse } = validated.body;
        console.log("SelectedProducts: ",selectedProducts);
        console.log("From warehouse: ",fromWarehouse);
        console.log("To warehouse: ",toWarehouse);


        const response = await createNewTransferService({
            selectedProducts,
            fromWarehouse,
            toWarehouse,
            createdBy: authUser?.trigram ?? null
        })
        
        return res.status(200).json({message: 'Successfully created',transferNo:response.transferNo})
        
    } catch (error:any) {
        console.log('Error occured in createNewTransfer: ', error);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error.' });        
    }
}

export const dispatchTransferItems = async(req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        const createdBy =authUser?.trigram ?? null

        console.log("Req query params: ", req.query);
        console.log("Req body : ", req.body);

        const validated = validateRequest(DispatchTransferItemsSchema,{
            body: req.body,
            query: req.query
        })
        const { fromWarehouseId, fromWarehouseName, transferNo, dispatchTransferItems } = validated.body;

        const response = await dispatchTransferItemsService({
            fromWarehouseId,
            fromWarehouseName,
            transferNo,
            dispatchTransferItems,
            createdBy
        })

        return res.status(200).json({
            message: 'Transfer dispatched successfully.', 
            transferOrder:response.transferOrder, 
            inventoryTransactions: response.inventoryTransactions
        })

        
    } catch (error:any) {
        console.log('Error occured in dispatchTransferItems: ', error);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error.' });         
    }
}

export const receiveTransferItems = async(req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        const createdBy = authUser?.trigram ?? null;

        console.log("Req query receiveTransferItems: ", req.query);
        console.log("Req body receiveTransferItems: ", req.body);

        const validated = validateRequest(ReceiveTransferItemsSchema,{
            body: req.body,
            query: req.query
        })

        const { toWarehouseId, toWarehouseName, transferNo, receiveTransferItems } = validated.body

        const response = await receiveTransferItemsService({
            toWarehouseId,
            toWarehouseName,
            transferNo,
            receiveTransferItems,
            createdBy
        })
        
        return res.status(200).json({
            message:"Transfer received successfully.",
            transferOrder:response.transferOrder, 
            inventoryTransactions: response.inventoryTransactions
        })

    } catch (error:any) {
        console.log('Error occured in receiveTransferItems: ', error);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error.' });
        
    }
}

export const cancelTransferItems = async(req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        const createdBy = authUser?.trigram ?? null;

        console.log("Req query receiveTransferItems: ", req.query);
        console.log("Req body receiveTransferItems: ", req.body);

        const validated = validateRequest(CancelTransferItemsSchema,{
            body: req.body,
            query: req.query
        })

        const { fromWarehouseId, fromWarehouseName, transferNo } = validated.body

        const response = await cancelTransferItemsService({
            fromWarehouseId,
            fromWarehouseName,
            transferNo,
            createdBy
        })
        
        return res.status(200).json({
            message:"Transfer received successfully.",
            transferOrder:response.transferOrder, 
            inventoryTransactions: response.inventoryTransactions
        })

    } catch (error:any) {
        console.log('Error occured in receiveTransferItems: ', error);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error.' });
        
    }
}

export const getTransfers = async(req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        console.log("Req query params getTransfers: ", req.query);
        const validated = validateRequest(GetTransfersSchema,{
            query: req.query
        })

        const { warehouseId, search, statusFilter, directionFilter, page, limit } = validated;

        const response = await GetTransfersService(validated);

        return res.status(200).json({
            transferOrders: response.transferOrders,
            totalPages: response.totalRows===0 ? 1 : Math.ceil(response.totalRows/validated.limit),
            message: 'Successfully fetched transfers.'
        })
        
    } catch (error:any) {
        console.log('Error occured in getTransfers: ', error);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error.' });       
    }
}


export const getTransferByTransferNo = async(req:AuthRequest, res:Response) => {
    try {
        const authUser = req.authUser;
        console.log("Req query getTransferByTransferNo: ", req.query);
        console.log("Req params getTransferByTransferNo: ", req.params);
        const { selectedWarehouseId } = req.query;
        const { transferNo } = req.params;

        const validated = validateRequest(GetTransferByTransferNoSchema,{
            query: req.query,
            params: req.params
        });

        const response = await GetTransferByTransferNoService(validated);

        return res.status(200).json({
            message: 'Successfully fetched transfers.',
            transfer: response.transfer,
            inventoryTransactions: response.inventoryTransactions
        })

        
    } catch (error:any) {
        console.log('Error occured in getTransfers: ', error);
        return res.status(500).json({ message:'Internal Server Error.' });        
    }
}