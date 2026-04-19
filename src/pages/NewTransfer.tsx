import { useAuth, type WarehouseAccess } from '@/context/AuthProvider'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useProductSelectionDialog } from '@/components/Dialog/ProductSelectionDialog/useProductSelectionDialog'
import ProductSelectionDialog from '@/components/Dialog/ProductSelectionDialog/ProductSelectionDialog';
import { Button } from '@/components/ui/button';
import type { WarehouseInventory } from '@/types/TableTypes';
import { useTransferOrder } from '@/hooks/useTransferOrder';
import SelectedProductsTable from '@/components/Transfers/SelectedProductsTable';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Plus, Truck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getWarehouseEmoji } from '@/utils/getWarehouseEmoji';
import { toast } from 'sonner';
import { handleApiError } from '@/components/handleApiError';
import { api } from '@/lib/api';


const NewTransfer = () => {
    const { user, selectedWarehouse, hasWarehouseAccess } = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    if(!selectedWarehouse) return //TODO:handle selectedWarehouse === null
    const navigate = useNavigate();
    const otherWarehouses = user?.warehouses.filter(w => w.warehouseId !==selectedWarehouse.warehouseId)
    const { selectedProducts, addProduct, removeProduct, onQuantityChange } = useTransferOrder();
    const { open, openDialog, closeDialog, isLoading: productsLoading, inventoryProducts, fetchInventoryProducts } = useProductSelectionDialog();
    // TODO: Handle Missing Warehouse
    if(!selectedWarehouse) return 
    const canManage = hasWarehouseAccess(selectedWarehouse.warehouseId, 'MANAGE');
    console.log("Can Manage warehouse: ",canManage)
    const [toWarehouse, setToWarehouse] = useState<WarehouseAccess | null>(null);
    const [reference, setReference] = useState<string>('');

    const handleTransferSubmit = async () => {
        if(!selectedWarehouse || !toWarehouse) {
            toast.error('Select source and destination warehouse to transfer.');
            return;
        }
        if(selectedProducts.length===0){
            toast.error('Select any products to transfer.');
            return;
        }

        const payload = {
            selectedProducts,
            fromWarehouse: selectedWarehouse,
            toWarehouse: toWarehouse
        }
        console.log("Payload to be sent to the backend: ",payload);
        try{
            setIsLoading(true);
            const response = await api.post('/transfers/new',payload);
            console.log("Created new transfer response: ",response.data);
            toast.success('Transfer Order Created Successfully.');
            const createdTransferNo = response.data.transferNo;
            navigate(`/transfers/${createdTransferNo}`)

        } catch(error:any){
            console.log("Error occured in handleTransferSubmit: ",error);
            handleApiError(error);
        } finally{
            setIsLoading(false);
        }
    }

  return (
    <motion.div
        initial={{ opacity:0, y:10 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.25 }}
        className='space-y-6'
    >
        {/* Header */}
        <div className='flex items-center gap-3'>
            <Button variant='ghost' size='icon' onClick={() => navigate('/transfers')}>
                <ArrowLeft className='h-5 w-5'/>
            </Button>
            <div>
                <h1 className='text-2xl font-bold text-gray-800'>New Transfer</h1>
                <p className='text-sm text-gray-500'>
                    From {selectedWarehouse.warehouseName}
                </p>
            </div>
        </div>

        {/* Transfer details */}
        <div className='grid gap-4 sm:grid-cols-3'>
            <div className="grid gap-2">
                <Label>From Warehouse</Label>

                <Select value={selectedWarehouse?.warehouseId.toString()}>
                    <SelectTrigger disabled>
                        <SelectValue placeholder="Select Warehouse..." />
                    </SelectTrigger>

                    <SelectContent>
                        {selectedWarehouse && (
                            <SelectItem key={selectedWarehouse.warehouseId} value={selectedWarehouse.warehouseId.toString()}>
                                {getWarehouseEmoji(selectedWarehouse.warehouseName)}{" "}
                                {selectedWarehouse.warehouseName}
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

            <div className='grid gap-2'>
                <Label>Destination Warehouse</Label>
                <Select value={toWarehouse?.warehouseId.toString()} onValueChange={value => {
                    const warehouse = otherWarehouses?.find(wh => wh.warehouseId.toString() === value);
                    setToWarehouse(warehouse ?? null);
                }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Warehouse..."/>
                    </SelectTrigger>
                    <SelectContent>
                        {otherWarehouses?.map(wh => (
                            <SelectItem key={wh.warehouseId} value={wh.warehouseId.toString()}>
                                {getWarehouseEmoji(wh.warehouseName)}  {wh.warehouseName}

                            </SelectItem>
                        ))}
                    </SelectContent>

                </Select>

            </div>

            {/* TODO: Reference */}


        </div>

        {/* Product Lines */}
        <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-gray-800'>Products</h2>
            <Button onClick={openDialog}>
                <Plus className='mr-2 h-4 w-4'/>
                Add Product
            </Button>

        </div>

        {/* Selected Products Table */}
        <SelectedProductsTable 
            products={selectedProducts}
            onQtyChange={onQuantityChange}
            onRemove={removeProduct}
        />


        {/* Footer Actions */}
        <div className='flex items-center justify-end gap-3'>
            <Button variant='outline' onClick={()=>navigate('/transfers')}>
                Cancel
            </Button>
            <Button onClick={()=>{
                handleTransferSubmit();
            }}
                disabled={selectedProducts.length===0 || !toWarehouse || isLoading}
            >
                <Truck className='mr-2 h-4 w-4'/>
                {isLoading? 'Loading...' : 'Initiate Transfer'}
            </Button>

        </div>


        <ProductSelectionDialog
            open = {open}
            onClose={closeDialog}
            isLoading= {productsLoading}
            inventoryProducts= {inventoryProducts}
            onProductClick={(product: WarehouseInventory)=>{
                console.log("Product selected: ",product);
                addProduct(product)
            }}
            reFetchProducts={fetchInventoryProducts}
        />

    </motion.div>
  )
}

export default NewTransfer