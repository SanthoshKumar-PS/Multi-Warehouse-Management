import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../utils/AuthRequest"
import { Response, NextFunction } from "express"

const prisma = new PrismaClient();

export const authorizeWarehouse = (requiredAccess?: 'VIEW' | 'MANAGE') => {
    return async (req: AuthRequest, res: Response, next:NextFunction) => {
        const userId = req.authUser?.id;
        const warehouseId = Number(req.query.selectedWarehouseId)
        if(!warehouseId || !userId){
            console.log("Required fileds missing in authorizeWarehouse");
            return res.status(403).json({ message:'Missing user or warehouse id.' })
        }

        const record = await prisma.userWarehouse.findUnique({
            where:{
                userId_warehouseId:{
                    userId,
                    warehouseId
                }
            }
        })

        if(!record){
            console.log("Warehouse Access Forbidden")
            return res.status(403).json({ message:'Warehouse Access Forbidden.' })
        }

        if(requiredAccess === 'MANAGE' && record.accessType!=='MANAGE'){
            return res.status(403).json({ message: 'Manage access required.' })
        }

        console.log("Warehouse Authorization completed")
        next();
    }
}