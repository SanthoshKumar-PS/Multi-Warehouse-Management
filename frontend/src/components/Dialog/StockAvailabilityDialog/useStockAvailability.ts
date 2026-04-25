import { handleApiError } from "@/components/handleApiError";
import { api } from "@/lib/api";
import type { WarehouseInventory } from "@/types/TableTypes";
import { useState } from "react"

export const useStockAvailability = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [stockAvailable, setStockAvailable] = useState<WarehouseInventory[]>([]);

    const openDialog = async (productMn: string) => {
        setOpen(true);
        setIsLoading(true);
        try {
            const res = await api.get(`/stock/product/${productMn}/availability`);
            setStockAvailable(res.data.stockAvailable);
        } catch (error:any) {
            console.log("Error occured in useStockAvailability: ", error);
            handleApiError(error);
        } finally{
            setIsLoading(false);
        }
    }

    const closeDialog = () => {
        setOpen(false);
        setStockAvailable([]);
    }

    return { open, isLoading, openDialog, closeDialog, stockAvailable } 
}