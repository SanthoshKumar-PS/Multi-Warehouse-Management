import type { TransferItem } from "@/types/TableTypes";
import { useState } from "react"
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";


type ReceiveTransferDialogProps = {
    open: boolean;
    loading: boolean;
    toWarehouseId: number;
    transferNo: string;
    transferItems: TransferItem[]
    onClose: () => void;
    onSubmit:(toWarehouseId: number, transferNo: string, receiveTransferItems: TransferItem[]) => void;
}

const ReceiveTransferDialog = ({open, loading, toWarehouseId, transferNo, transferItems,onClose, onSubmit}: ReceiveTransferDialogProps) => {
    const [receiveTransferItems, setReceiveTransferItems] = useState<TransferItem[]>(() => 
        transferItems.map(item => ({
            ...item,
            receivedQty: item.dispatchedQty
        }))
    );

    const handleReceiveQtyChange = (productMn:string, qty:number) => {
        setReceiveTransferItems(prev => {
            const target = prev.find(item => item.productMn===productMn)
            if(!target) return prev

            if(qty>target.dispatchedQty){
                toast.info('Received Quantity cannot be greater than Dispatched Quantity ')
                return prev
            }
            
            const safeQty = Math.max(0, qty);

            return prev.map(item => item.productMn===productMn
                ? {...item, receivedQty: safeQty}
                : item
            )
        })

    }
  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Receive Transfer - {transferNo}</DialogTitle>
                <DialogDescription>Confirm the received quantity for each product. Received quantity cannot exceed dispatched quantity.</DialogDescription>
            </DialogHeader>

            <div className="w-full max-h-[60vh] overflow-y-auto overflow-x-auto rounded-lg border bg-card">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="[&_th]:py-4 bg-gray-50/50">
                            <TableHead className="w-max">Product MN</TableHead>
                            <TableHead className="w-[120px]">Dispatched Qty</TableHead>
                            <TableHead className="w-[120px]">Received Qty</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {receiveTransferItems.length===0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                    No transfers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            receiveTransferItems.map(transferItem => {
                                const lostQty = transferItem.dispatchedQty - transferItem.receivedQty;

                                return (
                                    <TableRow
                                        key={transferItem.id}
                                        className="[&_td]:py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                    >
                                        <TableCell className="font-mono text-sm font-medium">
                                            {transferItem.productMn}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 font-medium">
                                            {transferItem.dispatchedQty}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size='icon-xs'
                                                    onClick={() =>{
                                                        handleReceiveQtyChange(transferItem.productMn,transferItem.receivedQty - 1)   
                                                    }}
                                                    disabled={transferItem.receivedQty <= 0}
                                                >
                                                    <Minus className="w-2 h-2"/>
                                                </Button>

                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={transferItem.requestedQty}
                                                    value={transferItem.receivedQty}
                                                    className="w-20 text-center"
                                                    onChange={(e) =>
                                                    handleReceiveQtyChange(
                                                        transferItem.productMn,
                                                        Number(e.target.value)
                                                    )
                                                    }
                                                />

                                                <Button
                                                    size='icon-xs'
                                                    onClick={() =>{
                                                        handleReceiveQtyChange(transferItem.productMn,transferItem.receivedQty + 1)
                                                    }}
                                                    disabled={transferItem.receivedQty >= transferItem.dispatchedQty}
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
                        console.log("Receive Button has been clicked.");
                        onSubmit(toWarehouseId, transferNo, receiveTransferItems);
                        console.log("receive payload sent: ",{
                            transferNo,
                            receiveTransferItems
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

export default ReceiveTransferDialog