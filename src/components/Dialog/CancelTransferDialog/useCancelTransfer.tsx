import { handleApiError } from "@/components/handleApiError";
import { api } from "@/lib/api";
import { useState } from "react"

export const useCancelTransfer = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const openDialog = () => {
        setOpen(true);
    }

    const closeDialog = () => {
        setOpen(false);
    }

    const submitCancelTransfer = async (fromWarehouseId: number, fromWarehouseName:string, transferNo:string) => {
        try {
            setIsLoading(true);
            const response = await api.patch(`/transfers/cancel/${transferNo}`, {
                fromWarehouseId,
                fromWarehouseName,
                transferNo
            })
            console.log("submitCancelTransfer Response: ",response.data);
            return {
                transferOrder: response.data.transferOrder,
                inventoryTransactions : response.data.inventoryTransactions
            }
        } catch (error:any) {
            console.log("Error occured in submitDispatchTransfer: ",error);
            handleApiError(error);
            return null;
        } finally{
            setIsLoading(false);
        }
    }

    return { open, isLoading, openDialog, closeDialog, submitCancelTransfer }
}