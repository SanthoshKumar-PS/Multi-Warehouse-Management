import { useAuth, type WarehouseAccess } from '@/context/AuthProvider'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

type TransferLine = {
    productMn: string,
    description: string,
    available: number,
    quantity: number
}

const NewTransfer = () => {
    const { user, selectedWarehouse } = useAuth();
    if(!selectedWarehouse) return //TODO:handle selectedWarehouse === null
    const navigate = useNavigate();
    const otherWarehouses = user?.warehouses.filter(w => w.warehouseId !==selectedWarehouse.warehouseId)

    const [toWarehouse, setToWarehouse] = useState<WarehouseAccess | null>(null);
    const [reference, setReference] = useState<string>('');

  return (
    <div>NewTransfer</div>
  )
}

export default NewTransfer