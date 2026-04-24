import { handleApiError } from "@/components/handleApiError";
import { api } from "@/lib/api";
import { useState } from "react"

export const useCancelPurchase = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const openDialog = () => {
        setOpen(true);
    }

    const closeDialog = () => {
        setOpen(false);
    }

    const submitCancelPurchase = async (poNumber:string) => {
        try {
            setIsLoading(true);
            const response = await api.patch(`/purchase-orders/cancel/${poNumber}`)
            console.log("submitCancelPurchase response: ", response.data);
            return {
                purchaseOrder: response.data.purchaseOrder
            }
        } catch (error:any) {
            console.log("Error occured in submitCancelPurchase: ", error);
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }

    }

    return { open, isLoading, openDialog, closeDialog, submitCancelPurchase }
}