import type { TransferItem, TransferOrder } from "@/types/TableTypes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

type DispatchTransferDialogProps = {
    open: boolean;
    loading: boolean;
    fromWarehouseId: number;
    fromWarehouseName: string;
    transferNo: string;
    transferItems: TransferItem[];
    onClose: () => void;
    onSubmit: (fromWarehouseId: number, fromWarehouseName: string, transferNo: string, dispatchTransferItems: TransferItem[]) => void;
}
const DispatchTransferDialog = ({ open, loading,fromWarehouseId, fromWarehouseName, transferNo, transferItems, onClose, onSubmit }:DispatchTransferDialogProps) => {
    const [dispatchTransferItems, setDispatchTransferItems] = useState<TransferItem[]>(()=>
        transferItems.map(item => ({
            ...item,
            dispatchedQty: item.requestedQty
        }))
    )
    const handleDispatchQtyChange = (productMn:string, qty:number) => {
        setDispatchTransferItems(prev => {
            const target = prev.find(item => item.productMn===productMn)
            if(!target) return prev

            if(qty>target.requestedQty){
                toast.info('Dispatched Quantity cannot be greater than Requested Quantity')
                return prev
            }

            const safeQty = Math.max(0, qty);

            return prev.map(item => 
                item.productMn === productMn
                    ? { ...item, dispatchedQty: safeQty }
                    : item
            )

        })
    }


  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
        <DialogHeader>
            <DialogTitle>Dispatch Transfer - {transferNo}</DialogTitle>
            <DialogDescription>Confirm the dispatched quantity for each product. Dispatched quantity cannot exceed requested.</DialogDescription>
        </DialogHeader>
        
        <div className="w-full max-h-[60vh] overflow-y-auto overflow-x-auto rounded-lg border bg-card">
            <Table className="w-full ">
                <TableHeader>
                <TableRow className="[&_th]:py-4 bg-gray-50/50">
                    <TableHead className="w-max">Product MN</TableHead>
                    <TableHead className="w-[120px]">Requested Qty</TableHead>
                    <TableHead className="w-[120px]">Dispatched Qty</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    { dispatchTransferItems.length===0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                No transfers found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        dispatchTransferItems.map(transferItem => {
                            const lostQty = transferItem.dispatchedQty - transferItem.receivedQty;
                            return (
                                <TableRow
                                    key={transferItem.id}
                                    className="[&_td]:py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                    // onClick={()=>{navigate(`/transfers/${transferItem.transferNo}`)}}
                                >
                                    <TableCell className="font-mono text-sm font-medium ">
                                        {transferItem.productMn}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600 font-medium">
                                        {transferItem.requestedQty}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size='icon-xs'
                                                onClick={() =>{
                                                    handleDispatchQtyChange(transferItem.productMn,transferItem.dispatchedQty - 1)   
                                                }}
                                                disabled={transferItem.dispatchedQty <= 0}
                                            >
                                                <Minus className="w-2 h-2"/>
                                            </Button>

                                            <Input
                                                type="number"
                                                min={0}
                                                max={transferItem.requestedQty}
                                                value={transferItem.dispatchedQty}
                                                className="w-20 text-center"
                                                onChange={(e) =>
                                                handleDispatchQtyChange(
                                                    transferItem.productMn,
                                                    Number(e.target.value)
                                                )
                                                }
                                            />

                                            <Button
                                                size='icon-xs'
                                                onClick={() =>{
                                                    handleDispatchQtyChange(transferItem.productMn,transferItem.dispatchedQty + 1)
                                                }}
                                                disabled={transferItem.dispatchedQty >= transferItem.requestedQty}
                                            >
                                                <Plus className="w-2 h-2"/>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>

            </Table>
        </div>

        <div className="flex w-full gap-2">
            <Button variant='outline' className="flex-1" onClick={onClose}>
                Cancel
            </Button>
            <Button variant='default' className="flex-1" 
                onClick={()=>{
                    console.log("Dispatch Button has been clicked.");
                    onSubmit(fromWarehouseId, fromWarehouseName, transferNo, dispatchTransferItems);
                    console.log("Dispatch payload sent: ",{
                        transferNo,
                        dispatchTransferItems
                    });
                    
                }}
            >
                {loading?'Loading...':'Dispatch'}
            </Button>

        </div>

        </DialogContent>

    </Dialog>
  )
}

export default DispatchTransferDialog