import { AuthUser, AvailablePermission, UserRole, UserType } from "./types";
import { Request } from 'express';


export interface AuthRequest extends Request{
    authUser?:AuthUser
}