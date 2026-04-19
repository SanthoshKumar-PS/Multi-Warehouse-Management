import { handleApiError } from "@/components/handleApiError";
import SupplierSelector from "@/components/Purchase/SupplierSelector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthProvider"
import { usePurchaseOrder } from "@/hooks/usePurchaseOrder";
import { api } from "@/lib/api";
import type { Supplier } from "@/types/TableTypes";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarIcon, Divide, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { usePurchaseProductDialog } from "@/components/Dialog/PurchaseProductDialog/usePurchaseProductDialog";


const NewPurchaseOrder = () => {
    const { selectedWarehouse, hasWarehouseAccess } = useAuth();
    const navigate = useNavigate();
    if(!selectedWarehouse) return //TODO:handle selectedWarehouse === null
    const canManage = hasWarehouseAccess(selectedWarehouse.warehouseId, 'MANAGE');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { poOrderItems, addProduct, removeProduct, onQuantityChange } = usePurchaseOrder();
    const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);
    const [supplierId, setSupplierId] = useState<number | null>(null);
    const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
    const [expectedDate, setExpectedDate] = useState<Date>();
    const [orderNotes, setOrderNotes] = useState<string>("");

    const [pickerOpen, setPickerOpen] = useState<boolean>(false);
    const [pickerSearch, setPickerSearch] = useState<string>("");

    const { open, isLoading: isPurchaseProductLoading, productsList, fetchProductsList, openDialog, closeDialog } = usePurchaseProductDialog();

    const handleAddNewSupplier = (supplier: Supplier) => {
        setSuppliersList(prev => [...prev,supplier]);
    }

    const fetchSupplierList = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/purchase-orders/suppliers')
            setSuppliersList(response.data.suppliers);
            console.log("Response from fetchSupplierList: ",response);
        } catch (error:any) {
            console.log("Error occured in fetchSupplierList: ",error);
            handleApiError(error);
        } finally{
            setIsLoading(false);
        }
    } 

    useEffect(()=>{
        fetchSupplierList()
    },[])
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
            <Button onClick={() => console.log("Clicked thus")}>
                <Plus className="mr-2 h-4 w-4"/>
                Add Product
            </Button>

        </div>



        {/* Purchase Product Dialog */}


    </motion.div>
  )
}

export default NewPurchaseOrder