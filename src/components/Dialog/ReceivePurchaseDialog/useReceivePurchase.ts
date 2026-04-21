import { handleApiError } from "@/components/handleApiError";
import { api } from "@/lib/api";
import type { PurchaseOrderItem } from "@/types/TableTypes";
import { useState } from "react"
export type ReceivePurchaseItemType = PurchaseOrderItem & {
    receiveNowQty: number;
}
export const useReceivePurchase = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const openDialog = () => {
        setOpen(true);
    }

    const closeDialog = () => {
        setOpen(false);
    }

    const submitReceivePurchase = async (poNumber:string, receievePurchaseItems: ReceivePurchaseItemType[]) => {
        try {
            setIsLoading(true);
            const response = await api.patch(`/purchase-orders/receive/${poNumber}`,{
                poNumber,
                receievePurchaseItems
            })
            console.log("Response from submitReceivePurchase: ",response.data);
        } catch (error:any) {
            console.log("Error occured in submitReceivePurchase: ", error);
            handleApiError(error);
            return null;
        } finally{
            setIsLoading(false);
        }
    }

    return { open, isLoading, openDialog, closeDialog, submitReceivePurchase }
}