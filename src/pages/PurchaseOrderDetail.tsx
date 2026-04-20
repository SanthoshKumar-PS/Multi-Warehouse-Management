import { handleApiError } from '@/components/handleApiError';
import { useAuth } from '@/context/AuthProvider';
import { api } from '@/lib/api';
import type { PurchaseOrder } from '@/types/TableTypes';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner';

const PurchaseOrderDetail = () => {
    const { poNumber } = useParams();
    const navigate = useNavigate();
    const { selectedWarehouse } = useAuth();

    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchPurchaseOrder = async () => {
        try{
            setIsLoading(true);
            if(!poNumber || poNumber.trim().length===0){
                toast.error('Purchase Order number is not provided.')
                return
            }
            const response = await api.get(`/purchase-orders/${poNumber}`)
            setPurchaseOrder(response.data.purchaseOrder)
            console.log("fetchPurchaseOrder Response: ", response.data);
        } catch(error:any){
            console.log("Error occured in fetchPurchaseOrder: ", error);
            handleApiError(error);
        } finally{
            setIsLoading(false);
        }
    }

    useEffect(()=> {
        fetchPurchaseOrder();
    },[])
    
  return (
    <div>{poNumber}</div>
  )
}

export default PurchaseOrderDetail