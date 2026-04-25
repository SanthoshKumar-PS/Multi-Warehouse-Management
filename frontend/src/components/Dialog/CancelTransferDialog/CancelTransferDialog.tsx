import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type CancelTransferDialogProps = {
    transferNo: string;
    fromWarehouseId: number;
    fromWarehouseName: string;
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (fromWarehouseId: number, fromWarehouseName:string, transferNo:string) => void;
}
const CancelTransferDialog = ({ transferNo, fromWarehouseId, fromWarehouseName, open, loading, onClose, onSubmit } : CancelTransferDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Cancel Transfer - {transferNo}</DialogTitle>
            </DialogHeader>
            <div className="mt-2 space-y-3">
                <p className="text-sm text-gray-800 font-medium">
                    Are you sure you want to cancel this transfer?
                </p>

                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 space-y-1">
                    <p>• All reserved quantities will be released back to the source warehouse.</p>
                    <p>• No items will be dispatched.</p>
                    <p className="font-semibold text-red-600">• This action cannot be undone.</p>
                </div>
            </div>

            <div className="flex w-full gap-2">
                <Button variant='outline' className="flex-1" onClick={onClose}>
                    Close
                </Button>
                <Button variant='default' className="flex-1" 
                    onClick={()=>{
                        console.log("Cancel Button has been clicked.");
                        onSubmit(fromWarehouseId, fromWarehouseName,transferNo);
                        console.log("Cancel payload sent: ",{
                            transferNo
                        });
                        
                    }}
                >
                    {loading?'Loading...':'Cancel'}
                </Button>

            </div>
        </DialogContent>

    </Dialog>
  )
}

export default CancelTransferDialog