import { useState } from "react"
import type { WarehouseInventory } from '../../../types/TableTypes'
import { handleApiError } from "../../handleApiError";
import { api } from "../../../lib/api";


export const useProductSelectionDialog = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [inventoryProducts, setInventoryProducts] = useState<WarehouseInventory[]>([]);

    const fetchInventoryProducts = async () => {
        try {
            setIsLoading(true);
            console.log("fetchInventoryProducts was called......");
            const response = await api.get('/stock')
            console.log("fetchInventoryProducts response: ", response.data);
            setInventoryProducts(response.data.products)
            
        } catch (error:any) {
            console.log("Error occured at fetchInventoryProducts: ", error);
            handleApiError(error)
        } finally {
            setIsLoading(false);
        }
    }

    const openDialog = () => {
        setOpen(true);
        fetchInventoryProducts();
    }

    const closeDialog = () => {
        setOpen(false);
    }

    return { open, openDialog, closeDialog, isLoading, inventoryProducts, fetchInventoryProducts }

}