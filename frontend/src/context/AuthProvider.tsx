import type { AvailablePermission, UserRole, UserType } from "@/types/DataTypes";
import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useNavigate } from 'react-router-dom';
export interface WarehouseAccess {
  warehouseId: number;
  warehouseName: string;
  warehouseLocation:string;
  accessType: "VIEW" | "MANAGE";
}

type SelectedCustomer = {
  customerId: number;
  customerGstin: string;
  customerName:string;
}

type AuthUser = {
    id: number;
    type:UserType;
    role:UserRole;
    permissions:AvailablePermission[];
    trigram?:string;
    gstin?:string;
    warehouses: WarehouseAccess[];
}

interface AuthContextType {
  token:string | null;
  setToken:Dispatch<SetStateAction<string|null>>;
  user: AuthUser | null;
  setUser:Dispatch<SetStateAction<AuthUser|null>>;
  selectedCustomer: SelectedCustomer|null;
  setSelectedCustomer: Dispatch<SetStateAction<SelectedCustomer | null>>;
  selectedWarehouse: WarehouseAccess | null;
  setSelectedWarehouse: Dispatch<SetStateAction<WarehouseAccess | null>>;
  hasPermission: (permission: AvailablePermission) => boolean;
  hasWarehouseAccess: (warehouseId: number, accessType?:'VIEW'|'MANAGE')=>boolean;
  getWarehouseAccessType: (warehouseId:number)=> 'VIEW' | 'MANAGE' | null 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType|null>(null);

const AuthProvider = ({children}:{children:ReactNode}) => {
  const [user, setUser] = useState<AuthUser|null>(()=>{
    const saved = localStorage.getItem('auth_user');
    return saved? JSON.parse(saved) : null
  });
  const [token, setToken] = useState<string|null>(()=>{
    const saved = localStorage.getItem('auth_token')
    return saved? saved : null
  });
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(()=>{
    const saved = localStorage.getItem('auth_selectedCustomer')
    return saved? JSON.parse(saved) : null
  });
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseAccess | null>(()=>{
    const saved = localStorage.getItem('auth_selectedWarehouse')
    return saved? JSON.parse(saved) : null
  })

  const navigate = useNavigate();
  

  useEffect(()=>{
    if(user) localStorage.setItem('auth_user',JSON.stringify(user))
    else localStorage.removeItem('auth_user') 
  },[user])

  useEffect(()=>{
    if(token) localStorage.setItem('auth_token',token)
    else localStorage.removeItem('auth_token') 
  },[token])

  useEffect(()=>{
    if(selectedCustomer) localStorage.setItem('auth_selectedCustomer',JSON.stringify(selectedCustomer))
    else localStorage.removeItem('auth_selectedCustomer') 
  },[selectedCustomer])

  useEffect(()=>{
    if(selectedWarehouse) localStorage.setItem('auth_selectedWarehouse', JSON.stringify(selectedWarehouse))
    else localStorage.removeItem('auth_selectedWarehouse')
  },[selectedWarehouse])

  const hasPermission = (permission: AvailablePermission) => {
    return user?.permissions.includes(permission) ?? false
  }

  const hasWarehouseAccess = (warehouseId:number, accessType?:'VIEW'|'MANAGE') => {
    if(!user) return false;
    
    const warehouse = user.warehouses.find(
        w => w.warehouseId===warehouseId
    );

    if(!warehouse) return false;

    if(!accessType) return true;

    if(accessType==='VIEW') return true;

    return warehouse.accessType==='MANAGE'

  }

  const getWarehouseAccessType = (warehouseId:number)=>{
    if(!user) return null;

    return (
        user.warehouses.find(w => w.warehouseId===warehouseId)?.accessType ?? null
    )
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setSelectedCustomer(null)
    setSelectedWarehouse(null)
    localStorage.clear()
    navigate(`/login`)
  }

  return (
    <AuthContext.Provider
      value={{token, setToken, user, setUser,selectedCustomer,setSelectedCustomer, selectedWarehouse, setSelectedWarehouse, hasPermission, hasWarehouseAccess, getWarehouseAccessType, logout}}
    >
      {children}

    </AuthContext.Provider>
  )

}

export default AuthProvider

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error("useAuth must be used inside AuthProvider")
    return ctx
}