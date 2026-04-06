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
            const response = await api.patch(`/transfers/dispatch/${transferNo}`, {
                fromWarehouseId,
                transferNo,
                dispatchTransferItems
            })
            console.log("submitDispatchTransfer Response: ",response.data);
            return {
                transferOrder: response.data.transferOrder,
                inventoryTransactions : response.data.inventoryTransactions
            }
        } catch (error:any) {
            console.log("Error occured in submitDispatchTransfer: ",error);
            handleApiError(error);
            return null
        } finally{
            setIsLoading(false);
        }
    }

    return { open, isLoading, openDialog, closeDialog, submitDispatchTransfer }

}