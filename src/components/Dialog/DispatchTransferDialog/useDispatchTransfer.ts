import { handleApiError } from "@/components/handleApiError";
import { api } from "@/lib/api";
import type { TransferItem, TransferOrder } from "@/types/TableTypes";
import { useState } from "react"

export const useDispatchTransfer = () => {
    const [open, setIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const openDialog = () => {
        setIsOpen(true);
    }

    const closeDialog = () => {
        setIsOpen(false);
    }

    const submitDispatchTransfer = async (fromWarehouseId: number, transferNo:string,dispatchTransferItems: TransferItem[]) => {
        try {
            setIsLoading(true);
            const response = await api.patch(`/transfers/${transferNo}`, {
                fromWarehouseId,
                transferNo,
                dispatchTransferItems
            })
            console.log("submitDispatchTransfer Response: ",response.data);
        } catch (error:any) {
            console.log("Error occured in submitDispatchTransfer: ",error);
            handleApiError(error);
        } finally{
            setIsLoading(false);
        }
    }

    return { open, isLoading, openDialog, closeDialog, submitDispatchTransfer }

}