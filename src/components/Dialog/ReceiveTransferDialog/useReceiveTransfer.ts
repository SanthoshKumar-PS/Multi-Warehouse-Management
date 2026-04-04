import { handleApiError } from "@/components/handleApiError";
import type { TransferItem } from "@/types/TableTypes";
import { useState } from "react"
import { toast } from "sonner";

export const useReceiveTransfer = () => {
    const [open,setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const openDialog = () => {
        setOpen(true);
    }

    const closeDialog = () => {
        setOpen(false);
    }

    const submitReceiveTransfer = async (toWarehouseId:number, transferNo:string, receiveTransferItems: TransferItem[]) => {
        try {
            setIsLoading(true);
            toast.info("Macha we came upto here for receiving transfer.")
            return {transferOrder:[], inventoryTransactions:[]}
        } catch (error:any) {
            console.log("Error occured in submitDispatchTransfer: ", error);
            handleApiError(error)
            return null
        } finally{
            setIsLoading(false);
        }
    }

    return { open, isLoading, openDialog, closeDialog, submitReceiveTransfer }
}