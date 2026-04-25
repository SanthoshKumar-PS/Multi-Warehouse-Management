import { AuthRequest } from "../utils/AuthRequest"
import { Response, NextFunction } from "express"
import { AvailablePermission } from "../utils/types";

export const authorize = (permissions:AvailablePermission[] = []) => {
    return (req:AuthRequest, res:Response, next:NextFunction) => {
        const userPermissions = req.authUser?.permissions;

        const allowed = permissions.some(p =>
            userPermissions?.includes(p)
        );
        if(!allowed){
            console.log("Forbidden access for the user.")
            return res.status(403).json({message:'Access Forbidden'})
        }
        console.log("Authorization completed")
        next();
    }
}