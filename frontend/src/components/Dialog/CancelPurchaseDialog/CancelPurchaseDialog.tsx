import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type CancelPurchaseDialogProps = {
  poNumber: string;
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (poNumber: string) => void;
};
const CancelPurchaseDialog = ({ poNumber, open, loading, onClose, onSubmit }: CancelPurchaseDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Purchase Order - {poNumber}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          <p className="text-sm text-gray-800 font-medium">
            Are you sure you want to cancel this purchase order?
          </p>

          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 space-y-1">
            <p>• This purchase order will be marked as cancelled.</p>
            <p>• No further receiving will be allowed.</p>
            <p>• Any pending quantities will remain unfulfilled.</p>
            <p className="font-semibold text-red-600">
              • This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="default"
            className="flex-1"
            onClick={() => {
              console.log("Cancel Purchase Order clicked.");
              onSubmit(poNumber);
              console.log("Cancel PO payload sent:", {
                poNumber,
              });
            }}
          >
            {loading ? "Loading..." : "Cancel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelPurchaseDialog;
