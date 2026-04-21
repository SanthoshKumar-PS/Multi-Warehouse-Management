import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { handleApiError } from '@/components/handleApiError';
import { Spinner } from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';
import { api } from '@/lib/api';
import type { PurchaseOrder } from '@/types/TableTypes';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { purchaseStatusBadge } from '@/utils/purchaseStatusBadge';
import { formatUtcToIST } from '@/utils/formatUtcToIST';
import { getWarehouseEmoji } from "@/utils/getWarehouseEmoji";
import PurchaseItemsTable from "@/components/Purchase/PurchaseItemsTable";
import { useReceivePurchase, type ReceivePurchaseItemType } from "@/components/Dialog/ReceivePurchaseDialog/useReceivePurchase";
import ReceivePurchaseDialog from "@/components/Dialog/ReceivePurchaseDialog/ReceivePurchaseDialog";
const PurchaseOrderDetail = () => {
    const { poNumber } = useParams();
    const navigate = useNavigate();
    const { selectedWarehouse } = useAuth();

    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const totalOrdered = purchaseOrder?.items?.reduce((s,i) => s+i.orderedQty,0) ?? 0;
    const totalReceived = purchaseOrder?.items?.reduce((s,i) => s+i.receivedQty,0) ?? 0;
    const totalRemaining = totalOrdered - totalReceived;

    const { open: isReceiveDialogOpen, isLoading: receiveLoading, openDialog: openReceiveDialog, closeDialog: closeReceiveDialog, submitReceivePurchase } = useReceivePurchase();

    const handleReceivePurchase = async (poNumber:string, receievePurchaseItems: ReceivePurchaseItemType[]) => {
        const result = await submitReceivePurchase(poNumber, receievePurchaseItems)
        if(!result) return;
        console.log("Result after receiving purchase order: ", result);
    }

    const fetchPurchaseOrder = async () => {
        try{
            setIsLoading(true);
            if(!poNumber || poNumber.trim().length===0){
                toast.error('Purchase Order number is not provided.')
                return
            }
            const response = await api.get(`/purchase-orders/poNumber/${poNumber}`)
            setPurchaseOrder(response.data.purchaseOrder)
            console.log("fetchPurchaseOrder Response: ", response.data);
        } catch(error:any){
            console.log("Error occured in fetchPurchaseOrder: ", error);
            handleApiError(error);
        } finally{
            setIsLoading(false);
        }
    }

    useEffect(()=> {
        fetchPurchaseOrder();
    },[])

    if(isLoading){
        return (
            <div className="flex-1 flex justify-center items-center py-30 md:py-40">
                <Spinner />
            </div>
        )
    }

    if(!purchaseOrder){
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-12 text-gray-500">
                <ArrowLeftRight className="mb-3 h-10 w-10"/>
                <p className="font-medium">Purchase order not found.</p>
                <p className="text-sm">Try changing the purchase number.</p>
                <Button size='sm' className="mt-2" onClick={()=>navigate('/purchase-orders')}>View All Purchase</Button>
            </div>
        )
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
            <Button variant='ghost' size='icon' onClick={() => navigate('/purchase-orders')}>
                <ArrowLeft className='h-5 w-5'/>
            </Button>
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">{purchaseOrder.poNumber}</h1>
                    <Badge variant='outline' 
                        className={`${purchaseStatusBadge[purchaseOrder.status]} whitespace-nowrap`}
                    >
                        {purchaseOrder.status}
                    </Badge>
                </div>
                <p className="text-sm text-gray-500">
                    Created {formatUtcToIST(purchaseOrder.createdAt)}
                    {purchaseOrder.createdBy && ` by ${purchaseOrder.createdBy}`}
                </p>
            </div>

            {/* TODO */}
            {/* Active Buttons */}
            <div className='flex items-center gap-2'>
                <Button
                    onClick={() => {
                        openReceiveDialog();
                    }}
                >Action Buttons</Button>
            </div>
        </div>


        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Supplier</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm font-semibold">{purchaseOrder.supplierName}</p>
                    {purchaseOrder.supplier?.phone && <p className="text-sm text-gray-500">{purchaseOrder.supplier?.phone}</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Warehouse</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm font-semibold">{purchaseOrder.warehouseName && getWarehouseEmoji(purchaseOrder.warehouseName)} {purchaseOrder.warehouseName}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Ordered</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{totalOrdered}</p>
                    <p className="text-xs text-gray-500">{purchaseOrder.items?.length} item(s)</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Received / Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">
                        <span className="text-green-500">{totalReceived}</span>
                        {totalRemaining > 0 && (
                            <span className="ml-2 text-sm font-normal text-gray-500">{totalRemaining} pending</span>
                        )}
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* Expected Date and Remarks */}
        {(purchaseOrder.expectedDate || purchaseOrder.remarks) && (
            <div className="flex flex-wrap gap-4">
                {purchaseOrder.expectedDate && (
                    <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                    <span className="font-medium text-foreground">Expected:</span>{" "}
                    <span className="text-muted-foreground">{formatUtcToIST(purchaseOrder.expectedDate)}</span>
                    </div>
                )}
                {purchaseOrder.remarks && (
                    <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Notes:</span> {purchaseOrder.remarks}
                    </div>
                )}
            </div>
        )}

        <h2 className="text-lg font-semibold text-gray-800">Purchase Items</h2>
        <PurchaseItemsTable purchaseItems={purchaseOrder.items??[]}/>


        {/* Receieve Dialog */}
        <ReceivePurchaseDialog
            open= {isReceiveDialogOpen}
            loading= {receiveLoading}
            poNumber= {poNumber!}
            purchaseItems= {purchaseOrder.items ?? []}
            onClose= {closeReceiveDialog}
            onSubmit= {handleReceivePurchase}
        />
    </motion.div>
  )
}

export default PurchaseOrderDetail