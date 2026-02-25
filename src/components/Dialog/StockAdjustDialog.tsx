import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { InventoryTxnType, WarehouseInventory } from "@/types/TableTypes";
import { api } from "@/lib/api";
import { validateInventoryTransaction } from "@/utils/validateInventoryTxn";
import { handleApiError } from "../handleApiError";

export type StockTransactionInput = {
    productMn: string;
    warehouseId: number;
    type: string;
    qtyChange: number;
    reference: string;
}
interface DialogProps {
  open: boolean;
  inventoryProduct: WarehouseInventory | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: StockTransactionInput) => void;
}

const StockAdjustDialog = ({ open, inventoryProduct, loading, onClose, onSubmit }: DialogProps) => {
  const [type, setType] = useState<InventoryTxnType>("ADJUSTMENT");
  const [qty, setQty] = useState(0);
  const [reference, setReference] = useState("");
  const [adjSign, setAdjSign] = useState<1 | -1>(1);

  const handleClose = () => {
    setQty(0);
    setReference("");
    onClose();
  };

  useEffect(() => {
  if (open) {
    setType("ADJUSTMENT");
    setQty(0);
    setReference("");
    setAdjSign(1);
  }
}, [open]);

  
const handleProcess = () => {
  if (!inventoryProduct) return;

  if(!reference || reference.length===0){
    toast.error('Provide reference value.')
    return
  }

  const result = validateInventoryTransaction({
    type,
    qty,
    adjSign,
    physicalQty: inventoryProduct.physicalQty,
    reservedQty: inventoryProduct.reservedQty,
  });

  if (!result.isValid) {
    toast.error(result.error);
    return;
  }
  console.log('Inventory Transaction Validation success')

  onSubmit({
    productMn: inventoryProduct.productMn,
    warehouseId: inventoryProduct.warehouseId,
    type,
    qtyChange: result.qtyChange,
    reference,
  });
};

  const physical = inventoryProduct?.physicalQty ?? 0;
  const reserved = inventoryProduct?.reservedQty ?? 0;
  const atp = physical - reserved;


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Stock Transaction: {inventoryProduct?.productMn}
          </DialogTitle>
        </DialogHeader>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-10 text-center text-gray-800">
            Loading inventory...
          </div>
        )}

        {/* CONTENT */}
        {!loading && inventoryProduct && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as InventoryTxnType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INWARD">Inward</SelectItem>
                  <SelectItem value="OUTWARD">Outward</SelectItem>
                  <SelectItem value="RESERVE">Reserve</SelectItem>
                  <SelectItem value="RELEASE">Release</SelectItem>
                  <SelectItem value="TRANSFER_OUT">Transfer Out</SelectItem>
                  <SelectItem value="TRANSFER_IN">Transfer In</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex gap-2">
                {type === "ADJUSTMENT" && (
                  <>
                    <Button
                      variant={adjSign === 1 ? "default" : "outline"}
                      onClick={() => setAdjSign(1)}
                    >
                      +
                    </Button>
                    <Button
                      variant={adjSign === -1 ? "destructive" : "outline"}
                      onClick={() => setAdjSign(-1)}
                    >
                      -
                    </Button>
                  </>
                )}
                <Input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.abs(Number(e.target.value)))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reference</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="bg-slate-50 p-3 rounded text-sm grid grid-cols-2 gap-2 border">
              <div>Physical: <b>{physical}</b></div>
              <div>Reserved: <b>{reserved}</b></div>
              <div className="col-span-2 text-blue-600 border-t pt-1">
                Available To Promise: <b>{atp}</b>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleProcess}
            disabled={loading || !inventoryProduct}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustDialog;
