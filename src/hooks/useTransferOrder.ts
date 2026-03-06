import type { WarehouseInventory } from "@/types/TableTypes";
import { useState } from "react"
import { toast } from "sonner";
export type SelectedProductType = {
    productMn: string;
    description: string;
    availableQty: number;
    qty:number;
}
export const useTransferOrder = () => {
    const [selectedProducts, setSelectedProducts] = useState<SelectedProductType[]>([]);
    const addProduct = (product:WarehouseInventory) => {
        const availableQty = product.physicalQty-product.reservedQty
        if(availableQty<=0){
            toast.error('Cannot add this product')
            return
        }
        setSelectedProducts(prev=>{
            const existing = prev.find(item => item.productMn === product.productMn)
            if(existing){
                if(existing.qty>=existing.availableQty){
                    toast.error("Maximum available quantity reached");
                    return prev;
                }

                return prev.map(item => 
                    item.productMn === product.productMn
                        ? { ...item, qty:item.qty+1 }
                        : item
                )
            } else{
                return [
                    ...prev,
                    {
                        productMn: product.productMn,
                        description: product.product?.description || 'Description Not Found',
                        availableQty: availableQty,
                        qty: 1
                    }
                ]
            }
        })
    }

    const removeProduct = (productMn:string) => {
        setSelectedProducts(prev => (
            prev.filter(item => item.productMn!==productMn)
        ))
    }

    const onQuantityChange = (productMn: string, newQty:number) => {
        if(newQty<=0){
            toast.error('Quantity cannot be zero.')
            return;
        }

        setSelectedProducts(prev => (
            prev.map(item => {
                if(item.productMn!==productMn) return item;
                
                if(newQty>item.availableQty){
                    toast.error('Cannot be greater than available quantity.')
                    return item
                }

                return {
                    ...item,
                    qty: newQty
                }
            }
        )))
    }

    return { selectedProducts, addProduct, removeProduct, onQuantityChange }
}