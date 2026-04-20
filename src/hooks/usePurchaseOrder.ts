import type { Product } from "@/types/TableTypes";
import { useState } from "react"
import { toast } from "sonner";

export type PurchaseOrderItemInput = {
  productMn: string;
  productDescription: string;
  orderedQty: number;
};
export const usePurchaseOrder = () => {
    const [poOrderItems, setPoOrderItems] = useState<PurchaseOrderItemInput[]>([]);

    const addProduct = (product:Product) => {
        setPoOrderItems(prev => {
            const existing = prev.find(item => item.productMn===product.mn)
            if(existing){
                return prev.map(item => item.productMn===product.mn
                        ? {...item, orderedQty: item.orderedQty+1}
                        : item
                )
            }
            else{
                return [
                    ...prev,
                    {
                        productMn: product.mn,
                        productDescription: product.description,
                        orderedQty: 1
                    }
                ]
            }
        })
    }

    const removeProduct = (productMn: string) => {
        setPoOrderItems(prev =>
            prev.filter(item => item.productMn!==productMn)
        )
    }

    const onQuantityChange = (productMn: string, newQty: number) => {
        if(newQty<=0){
            toast.error('Quantity must be greater than 0.')
            return;
        }

        setPoOrderItems(prev => 
            prev.map(item => {
                if(item.productMn!==productMn){
                    return item
                }
                return {
                    ...item,
                    orderedQty: newQty
                }
            })
        )
    }

    return { poOrderItems, addProduct, removeProduct, onQuantityChange }
    
}