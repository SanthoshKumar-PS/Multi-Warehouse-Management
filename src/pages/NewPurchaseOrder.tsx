import { handleApiError } from "@/components/handleApiError";
import SupplierSelector from "@/components/Purchase/SupplierSelector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthProvider"
import { usePurchaseOrder } from "@/hooks/usePurchaseOrder";
import { api } from "@/lib/api";
import type { Product, Supplier } from "@/types/TableTypes";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarIcon, Divide, Import, Plus, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { usePurchaseProductDialog } from "@/components/Dialog/PurchaseProductDialog/usePurchaseProductDialog";
import PurchaseProductDialog from "@/components/Dialog/PurchaseProductDialog/PurchaseProductDialog";
import SelectedPurchaseProductTable from "@/components/Purchase/SelectedPurchaseProductTable";
import { toast } from "sonner";


const NewPurchaseOrder = () => {
    const { selectedWarehouse, hasWarehouseAccess } = useAuth();
    const navigate = useNavigate();
    if(!selectedWarehouse) return //TODO:handle selectedWarehouse === null
    const canManage = hasWarehouseAccess(selectedWarehouse.warehouseId, 'MANAGE');
    // TODO: decide what to do when the user doesn't have manage access

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { poOrderItems, addProduct, removeProduct, onQuantityChange } = usePurchaseOrder();
    const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);
    const [supplierId, setSupplierId] = useState<number | null>(null);
    const [isSupplierLoading, setIsSupplierLoading] = useState<boolean>(false);
    const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
    const [expectedDate, setExpectedDate] = useState<Date>();
    const [orderNotes, setOrderNotes] = useState<string>("");

    const [pickerOpen, setPickerOpen] = useState<boolean>(false);
    const [pickerSearch, setPickerSearch] = useState<string>("");

    const { open: isPurchaseProductDialogOpen, isLoading: isPurchaseProductLoading, productsList, fetchProductsList, openDialog: openPurchaseProductDialog, closeDialog: closePurchaseProductDialog } = usePurchaseProductDialog();

    const handleAddNewSupplier = (supplier: Supplier) => {
        // TODO: handle add new supplier
        setSuppliersList(prev => [...prev,supplier]);
    }

    const handleSelectProduct = (product: Product) => {
        console.log("Clicked product: ",product);
        addProduct(product);
    }

    const fetchSupplierList = async () => {
        try {
            setIsSupplierLoading(true);
            const response = await api.get('/purchase-orders/suppliers')
            setSuppliersList(response.data.suppliers);
            console.log("Response from fetchSupplierList: ",response);
        } catch (error:any) {
            console.log("Error occured in fetchSupplierList: ",error);
            handleApiError(error);
        } finally{
            setIsSupplierLoading(false);
        }
    } 

    useEffect(()=>{
        fetchSupplierList()
    },[])

    const handleCreatePurchaseOrder = async () => {
        try {
            if(!supplierId){
                toast.info("Please select supplier to create purchase order.")
                return;
            }
            if(!expectedDate){
                toast.info("Select expected date to proceed further.")
                return;
            }
            if(poOrderItems.length===0){
                toast.info("Select atleast product to proceed.")
                return;
            }
            const payload = {
                poOrderItems,
                supplierId,
                expectedDate,
                orderNotes
            }

            try {
                setIsLoading(true);
                console.log("Payload sent to create purchase order: ",payload);
                const response = await api.post('/purchase-orders/new', payload);
                console.log("Response receieved for purchase: ", response.data);
            } catch (error:any) {
                console.log("Error occured in handleCreatePurchaseOrder: ",error);
                handleApiError(error);
            } finally{
                setIsLoading(false);
            }
            
            
        } catch (error:any) {
            console.log("Error occured in handleCreatePurchaseOrder: ",error);
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
        className="space-y-4"
    >
        {/* Header */}
        <div className="flex items-center gap-3">
            <Button variant='ghost' size='icon' onClick={()=>navigate('/purchase-orders')}>
                <ArrowLeft className="h-5 w-5"/>
            </Button>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Create Purchase Order</h1>
                <p className="text-sm text-gray-500">For {selectedWarehouse.warehouseName}</p>
            </div>
        </div>

        {/* PO Details */}
        <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
                <Label>Supplier</Label>
                <SupplierSelector
                    suppliers={suppliersList}
                    selectedSupplierId={supplierId}
                    onSelect={setSupplierId}
                    onAddSupplier={handleAddNewSupplier}
                    isLoading={isSupplierLoading}
                />

            </div>

            <div className="grid gap-2">
                <Label>Expected Delivery Date</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant='outline'
                            className={cn("justify-start text-left font-normal", !expectedDate && "text-gray-800")}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4"/>
                            {expectedDate? format(expectedDate, 'PPP') : "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 " align="start">
                        <Calendar
                            mode="single"
                            selected={expectedDate}
                            onSelect={(date) => {
                                setExpectedDate(date);
                                setCalendarOpen(false);
                            }}
                            disabled={(date) => date< new Date()}
                            autoFocus
                            className="p-3 pointer-events-auto"
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid gap-2">
                <Label>Notes (optional)</Label>
                <Input
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Internal notes"
                />
            </div>
        </div>


        {/* Product lines header */}
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Order Items</h2>
            <Button onClick={() => {openPurchaseProductDialog()}}>
                <Plus className="mr-2 h-4 w-4"/>
                Add Product
            </Button>

        </div>

        {/* Selected Purchase Products Table */}
        <SelectedPurchaseProductTable
            purchaseProductItems={poOrderItems}
            onQtyChange={onQuantityChange}
            onRemove={removeProduct}
        />

        {/* Footer Actions */}
        {/* Footer Actions */}
        <div className='flex items-center justify-end gap-3'>
            <Button variant='outline' onClick={()=>navigate('/transfers')}>
                Cancel
            </Button>
            <Button onClick={()=>{
                handleCreatePurchaseOrder()
            }}
                disabled={poOrderItems.length===0 || isLoading}
            >
                <Import className='mr-2 h-4 w-4'/>
                {isLoading? 'Loading...' : 'Create Purchase'}
            </Button>

        </div>



        {/* Purchase Product Dialog */}
        <PurchaseProductDialog
            open = {isPurchaseProductDialogOpen}
            onClose= {closePurchaseProductDialog} 
            purchaseProducts= {productsList}
            isLoading= {isPurchaseProductLoading}
            onProductClick= {handleSelectProduct}
            reFetchProducts = {fetchProductsList}
        />


    </motion.div>
  )
}

export default NewPurchaseOrder