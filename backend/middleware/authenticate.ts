import { Response, NextFunction } from 'express'
import jwt from "jsonwebtoken";
import { AuthRequest } from '../utils/AuthRequest';
import { AuthUser } from '../utils/types';

export const authenticate = (req:AuthRequest, res:Response,next:NextFunction) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(401).json({message:'Unauthorized'});
    }
    const token = authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({message:'Unauthorized'});
    }
    try {
        const decoded = jwt.verify(token,'JWT_SECRET');
        req.authUser = decoded as AuthUser;
        // console.log("Auth user: ", decoded)
        console.log("Authentication completed")
        next();
    } catch (error:any) {
        return res.status(401).json({message:'Invalid token'})
    }
}