import { api } from "@/lib/api";
import type { WarehouseInventory } from "@/types/TableTypes";
import { useState } from "react"
import { handleApiError } from "../handleApiError";
import type { StockTransactionInput } from "./StockAdjustDialog";
import { toast } from "sonner";

export const useStockAdjustDialog = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [inventoryProduct, setInventoryProduct] = useState<WarehouseInventory | null>(null);

    const openDialog = async (productMn: string) => {
        setOpen(true);
        setIsLoading(true);
        try {
        const res = await api.get("/stock/product", { params: { productMn } });
        setInventoryProduct(res.data.inventoryProduct);
        } catch (e) {
        handleApiError(e);
        } finally {
        setIsLoading(false);
        }
    }

    const closeDialog = () => {
        setOpen(false);
        setInventoryProduct(null);
    }

    const submitStockTransaction = async (data:StockTransactionInput) => {
        try {
            setIsLoading(true);
            console.log("Data recieved to send API call: ",data)
            const response = await api.post('/stock/transaction', data);
            console.log("submitStockTransaction response: ", response.data);
            toast.success('Updated stock successfully.')
            setInventoryProduct(response.data.updatedInventoryProduct)
            return response.data.updatedInventoryProduct as WarehouseInventory
        } catch (error:any) {
            handleApiError(error);
            return null
        } finally{
            setIsLoading(false);
        }
    }

    return {
        open, inventoryProduct, isLoading, openDialog, closeDialog, submitStockTransaction 
    }
}