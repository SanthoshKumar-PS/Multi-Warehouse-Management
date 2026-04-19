import { handleApiError } from "@/components/handleApiError";
import { api } from "@/lib/api";
import type { Product } from "@/types/TableTypes";
import { useState } from "react"

export const usePurchaseProductDialog = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [productsList, setProductsList] = useState<Product[]>([]);

    const fetchProductsList = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/purchase-orders/products');
            setProductsList(response.data.products);
            console.log("Response from fetchProductsList: ",response.data);
        } catch (error:any) {
            console.log("Error occured at fetchProductsList: ", error);
            handleApiError(error);            
        } finally{
            setIsLoading(false);
        }
    }
    const openDialog = () => {
        setOpen(true);
        if(productsList.length===0){
            fetchProductsList()
        }
    }

    const closeDialog = () => {
        setOpen(false);
    }

    return { open, isLoading, productsList, fetchProductsList, openDialog, closeDialog }
}