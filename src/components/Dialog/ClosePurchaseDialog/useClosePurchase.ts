import { handleApiError } from "@/components/handleApiError";
import { api } from "@/lib/api";
import { useState } from "react";

export const useClosePurchase = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const openDialog = () => {
        setOpen(true);
    }

    const closeDialog = () => {
        setOpen(false);
    }

    const submitClosePurchase = async (poNumber:string) => {
        try {
            setIsLoading(true);
            const response = await api.patch(`/purchase-orders/close/${poNumber}`)
            console.log("submitClosePurchase response: ", response.data);
            return {
                purchaseOrder: response.data.purchaseOrder,
                inventoryTransactions: response.data.inventoryTransactions
            }
        } catch (error:any) {
            console.log("Error occured in submitClosePurchase: ", error);
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }

    }

    return { open, isLoading, openDialog, closeDialog, submitClosePurchase }
}