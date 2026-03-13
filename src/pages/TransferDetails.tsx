import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import type { InventoryTransaction, TransferItem, TransferOrder } from "@/types/TableTypes";
import { formatUtcToIST } from "@/utils/formatUtcToIST";
import { transferStatusBadge } from "@/utils/transferStatusBadge";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowLeftRight, MoveRight, PackageCheck, Truck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWarehouseEmoji } from "@/utils/getWarehouseEmoji";
import TransferItemsTable from "@/components/Transfers/TransferItemsTable";
import { Spinner } from "@/components/Spinner";
import { handleApiError } from "@/components/handleApiError";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useDispatchTransfer } from "@/components/Dialog/DispatchTransferDialog/useDispatchTransfer";
import DispatchTransferDialog from "@/components/Dialog/DispatchTransferDialog/DispatchTransferDialog";


const TransferDetails = () => {
    const { transferNo } = useParams();
    const navigate = useNavigate();
    const { selectedWarehouse } = useAuth();

    const [transfer, setTransfer] = useState<TransferOrder | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const isSourceWarehouse = selectedWarehouse?.warehouseId === transfer?.fromWarehouseId;
    const isDestinationWarehouse = selectedWarehouse?.warehouseId === transfer?.toWarehouseId;
    const totalRequested = (transfer?.items??[]).reduce((sum,item) => sum+item.requestedQty, 0);
    const totalDispatched = (transfer?.items??[]).reduce((sum,item) => sum+item.dispatchedQty, 0);
    const totalReceived = (transfer?.items??[]).reduce((sum,item) => sum+item.receivedQty , 0);
    const totalLost = totalRequested - totalReceived;

    const { open, isLoading: dialogLoading, openDialog, closeDialog, submitDispatchTransfer } = useDispatchTransfer();

    const handleDispatchTransfer = async (fromWarehouseId: number, transferNo:string,dispatchTransferItems: TransferItem[]) => {
        const result = await submitDispatchTransfer(fromWarehouseId, transferNo ,dispatchTransferItems)
        if(!result) return;
        const { transferOrder } = result;
        setTransfer(transferOrder);
        toast.success('Transfer order dispatched successfully.');
        closeDialog()
        console.log("Result for dispatch transfer: ",result);

    }


    // const totalItem
    // TODO: Handle Missing Warehouse
    if(!selectedWarehouse) return;
    console.log("transferNo: ",transferNo);

    const fetchTransferOrder = async () => {
        try {
            setIsLoading(true);
            if(!transferNo){
                toast.error('Transfer number is not provided.');
                return;
            }
            const response = await api.get(`/transfers/${transferNo}`);
            console.log("fetchTransferOrder Response: ",response.data);
            setTransfer(response.data.transfer);

        } catch (error:any) {
            console.log("Error occured in fetchTransferOrder: ",error);
            handleApiError(error);            
        } finally{
            setIsLoading(false);
        }
    }

    useEffect(()=> {
        fetchTransferOrder();
    },[])

    if(isLoading){
        return (
            <div className="flex-1 flex justify-center items-center py-30 md:py-40">
                <Spinner />
            </div>
        )
    }

    if(!transfer){
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-12 text-gray-500">
                <ArrowLeftRight className="mb-3 h-10 w-10"/>
                <p className="font-medium">Transfer not found.</p>
                <p className="text-sm">Try changing the transfer number.</p>
                <Button size='sm' className="mt-2" onClick={()=>navigate('/transfers')}>View All Transfers</Button>
            </div>
        )
    }

  return (
    <motion.div
        initial={{ opacity:0, y:10 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.25 }}
        className="space-y-6"
    >
        {/* Header */}
        <div className="flex items-center gap-3">
            <Button variant='ghost' size='icon' onClick={()=> navigate('/transfers')}>
                <ArrowLeft className="h-5 w-5"/>
            </Button>
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">{transfer.transferNo}</h1>
                    <Badge variant='outline' 
                        className={`${transferStatusBadge[transfer.status]} whitespace-nowrap`}
                    >
                        {transfer.status}
                    </Badge>
                </div>
                <p className="text-sm text-gray-500">
                    Created {formatUtcToIST(transfer.createdAt)}
                    {transfer.createdBy && ` by ${transfer.createdBy}`}
                </p>
            </div>

            {/* Active buttons based on status and warehouse context */}
            <div className="flex items-center gap-2">
                {transfer.status === 'CREATED' && isSourceWarehouse && (
                    <>
                        <Button variant='destructive' onClick={()=>{console.log("Handle Cancel");}}>
                            <XCircle className="mr-2 h-4 w-4"/>
                            Cancel Transfer
                        </Button>
                        <Button onClick={()=>{
                            console.log("Opening dialog");
                            openDialog();
                        }}>
                            <Truck className="mr-2 h-4 w-4"/>
                            Dispatch
                        </Button>
                    </>
                )}
                {/* TODO: Decide which status to use */}
                {(transfer.status === 'DISPATCHED' || transfer.status === 'IN_TRANSIT') && isDestinationWarehouse && (
                    <Button onClick={()=>{console.log("Receive button clicked");}}>
                        <PackageCheck className="mr-2 h-4 w-4"/>
                        Receive Transfer
                    </Button>
                )}
            </div>
        </div>



        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Route</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <span>{transfer.fromWarehouseName && getWarehouseEmoji(transfer.fromWarehouseName)} {transfer.fromWarehouseName}</span>
                        <MoveRight className="h-4 w-4 text-gray-500"/>
                        <span>{transfer.toWarehouseName && getWarehouseEmoji(transfer.toWarehouseName)} {transfer.toWarehouseName}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Requested</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{totalRequested}</p>
                    <p className="text-xs text-gray-500">{transfer.items?.length} item(s)</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Dispatched</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{totalDispatched}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Received / Lost</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">
                        <span className="text-green-500">{totalReceived}</span>
                        {totalLost > 0 && totalReceived>0  && (
                            <span className="ml-2 text-red-500">{totalLost} lost</span>
                        )}
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* TODO: Notes */}
        <div className="rounded-lg border bg-gray-200/30 px-4 py-3 text-sm text-gray-800">
            <span className="font-medium text-gray-800">Notes: </span>{'We have to add notes.'}
        </div>

        {/* Items Table */}
        <h2 className="text-lg font-semibold text-gray-800">Transfer Items</h2>
        <TransferItemsTable transferItems={transfer.items??[]}/>


        <DispatchTransferDialog
            open={open}
            loading={dialogLoading}
            fromWarehouseId= {transfer.fromWarehouseId}
            transferNo={transfer.transferNo}
            transferItems={transfer.items??[]}
            onClose={closeDialog}
            onSubmit={handleDispatchTransfer}
        />


    </motion.div>
  )
}

export default TransferDetails