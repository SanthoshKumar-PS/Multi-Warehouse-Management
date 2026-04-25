import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PurchaseOrderItem } from "@/types/TableTypes";
import { useEffect, useState } from "react";
import { type ReceivePurchaseItemType } from './useReceivePurchase'
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

type ReceivePurchaseDialogProps = {
    open: boolean;
    loading: boolean;
    poNumber: string;
    purchaseItems: PurchaseOrderItem[];
    onClose: () => void;
    onSubmit: (poNumber:string, receievePurchaseItems: ReceivePurchaseItemType[]) => void;
}

const ReceivePurchaseDialog = ({open, loading, poNumber, purchaseItems, onClose, onSubmit} : ReceivePurchaseDialogProps) => {
    const [receivePurchaseItems, setReceivePurchaseItems] = useState<ReceivePurchaseItemType[]>(() => 
        purchaseItems.map(item => ({
            ...item,
            receiveNowQty: item.orderedQty-item.receivedQty
        }))
    );

    useEffect(()=>{
        setReceivePurchaseItems(
            purchaseItems.map(item => ({
                ...item,
                receiveNowQty: item.orderedQty-item.receivedQty
            }))
        )
    },[purchaseItems])

    const handleReceiveNowQtyChange = (productMn: string, qty: number) => {
        setReceivePurchaseItems(prev => {
            const target = prev.find(item => item.productMn===productMn)
            if(!target) return prev

            const remainingQty = target.orderedQty-target.receivedQty

            if(qty>remainingQty){
                toast.info('Receiving quantity cannot be greater than remaining quantity.')
                return prev
            }

            const safeQty = Math.max(0, qty);

            return prev.map(item => item.productMn===productMn
                ? {...item, receiveNowQty: safeQty}
                : item
            )
        })
    }

  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="min-w-3xl">
            <DialogHeader>
                <DialogTitle>Receive Purchase - {poNumber}</DialogTitle>
                <DialogDescription>Enter the quantity received for each product. Cannot exceed the remaining quantity.</DialogDescription>
            </DialogHeader>

            <div className="w-full max-h-[60vh] overflow-y-auto overflow-x-auto rounded-lg border bg-card">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="[&_th]:py-4 bg-gray-50/50">
                            <TableHead className="w-max">Product MN</TableHead>
                            <TableHead className="w-[120px]">Ordered Qty</TableHead>
                            <TableHead className="w-[120px]">Received Qty</TableHead>
                            <TableHead className="w-[120px]">Remaining Qty</TableHead>
                            <TableHead className="w-[120px]">Recieving Qty</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {receivePurchaseItems.length===0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    No purchase items found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            receivePurchaseItems.map(purchaseItem => {
                                const remainingQty = purchaseItem.orderedQty-purchaseItem.receivedQty;

                                return (
                                    <TableRow
                                        key={purchaseItem.id}
                                        className="[&_td]:py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                    >
                                        <TableCell className="font-mono text-sm font-medium">
                                            {purchaseItem.productMn}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 font-medium">
                                            {purchaseItem.orderedQty}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 font-medium">
                                            {purchaseItem.receivedQty}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 font-medium">
                                            {remainingQty}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size='icon-xs'
                                                    onClick={() => {
                                                        handleReceiveNowQtyChange(purchaseItem.productMn, purchaseItem.receiveNowQty-1)
                                                    }}
                                                    disabled={purchaseItem.receiveNowQty<=0}
                                                >
                                                    <Minus className="w-2 h-2"/>
                                                </Button>

                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={remainingQty}
                                                    value={purchaseItem.receiveNowQty}
                                                    className="w-20 text-center"
                                                    onChange={(e)=> {
                                                        handleReceiveNowQtyChange(purchaseItem.productMn, Number(e.target.value))
                                                    }}
                                                />

                                                <Button
                                                    size='icon-xs'
                                                    onClick={() => {
                                                        handleReceiveNowQtyChange(purchaseItem.productMn, purchaseItem.receiveNowQty+1)
                                                    }}
                                                    disabled={purchaseItem.receiveNowQty>=remainingQty}
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
                    onClick={() => {
                        console.log("Receive Purchase Button has been clicked.");
                        onSubmit(poNumber, receivePurchaseItems);
                        console.log("Receive purchase payload sent: ", {
                            poNumber,
                            receivePurchaseItems
                        });
                    }}
                >
                    {loading? 'Loading...' : 'Receive' }
                </Button>

            </div>
        </DialogContent>
    </Dialog>
  )
}

export default ReceivePurchaseDialog