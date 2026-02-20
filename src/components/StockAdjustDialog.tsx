import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { InventoryTxnType, WarehouseInventory } from "@/types/TableTypes";
interface AdjustDialogProps {
  selectedRow: WarehouseInventory | null;
  onClose: () => void;
  onSave: (data: {
    productMn: string;
    warehouseId: number;
    type: string;
    qtyChange: number;
    reference: string;
  }) => void;
}
const StockAdjustDialog = ({ selectedRow, onClose, onSave }: AdjustDialogProps) => {
  const [type, setType] = useState<InventoryTxnType>("ADJUSTMENT");
  const [qty, setQty] = useState<number>(0);
  const [reference, setReference] = useState<string>("");
  const [adjSign, setAdjSign] = useState<1 | -1>(1); // 1 for Add, -1 for Remove

  if (!selectedRow) return null;

  const currentPhysical = selectedRow.physicalQty;
  const currentReserved = selectedRow.reservedQty;
  const availableToPromise = currentPhysical - currentReserved;

  const handleProcess = () => {
    let change = qty;
    let error = "";

    const multipliers = {
      RESERVE: 1,
      RELEASE: -1,
      INWARD: 1,
      TRANSFER_IN: 1,
      OUTWARD: -1,
      TRANSFER_OUT: -1,
      ADJUSTMENT: adjSign, // assuming adjSign is 1 or -1
    };

    change = qty * (multipliers[type] || 1);

    switch (type) {
      case "RESERVE":
        if (qty > availableToPromise)
          error = `Cannot reserve ${qty}. Only ${availableToPromise} available to promise.`;
        break;

      case "RELEASE":
        if (qty > currentReserved)
          error = `Cannot release ${qty}. Only ${currentReserved} currently reserved.`;
        break;

      case "OUTWARD":
      case "TRANSFER_OUT":
        if (qty > currentPhysical) {
          error = `Not enough physical stock (Total: ${currentPhysical}).`;
        }
        else if (qty > availableToPromise) {
          error = `Action denied. ${qty} requested, but ${currentReserved} of your ${currentPhysical} units are reserved. Only ${availableToPromise} available.`;
        }
        break;

      case "ADJUSTMENT":
        const newPhysical = currentPhysical + qty * adjSign;
        if (newPhysical < 0) {
          error = "Physical stock cannot go below 0.";
        } else if (newPhysical < currentReserved) {
          error = `Adjustment failed. New physical total (${newPhysical}) would be less than current reservations (${currentReserved}).`;
        }
        break;

      case "INWARD":
      case "TRANSFER_IN":
        // Always allowed as they increase stock
        break;
    }

    if (error) {
      toast.error(error);
      return;
    }

    onSave({
      productMn: selectedRow.productMn,
      warehouseId: selectedRow.warehouseId,
      type,
      qtyChange: change,
      reference,
    });
  };

  return (
    <Dialog open={!!selectedRow} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stock Transaction: {selectedRow.productMn}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 1. Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select
              onValueChange={(value) => setType(value as InventoryTxnType)}
              defaultValue={type}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INWARD">Inward (Add Stock)</SelectItem>
                <SelectItem value="OUTWARD">Outward (Ship/Sold)</SelectItem>
                <SelectItem value="RESERVE">
                  Reserve (Hold for Order)
                </SelectItem>
                <SelectItem value="RELEASE">Release (Cancel Hold)</SelectItem>
                <SelectItem value="TRANSFER_OUT">Transfer Out</SelectItem>
                <SelectItem value="TRANSFER_IN">Transfer In</SelectItem>
                <SelectItem value="ADJUSTMENT">Manual Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 2. Quantity & Sign for Adjustment */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex gap-2">
              {type === "ADJUSTMENT" && (
                <Button
                  variant={adjSign === 1 ? "default" : "outline"}
                  className={adjSign === 1 ? "bg-green-600" : ""}
                  onClick={() => setAdjSign(1)}
                >
                  +
                </Button>
              )}
              {type === "ADJUSTMENT" && (
                <Button
                  variant={adjSign === -1 ? "default" : "outline"}
                  className={adjSign === -1 ? "bg-red-600" : ""}
                  onClick={() => setAdjSign(-1)}
                >
                  -
                </Button>
              )}
              <Input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.abs(Number(e.target.value)))}
              />
            </div>
          </div>

          {/* 3. Reference Input */}
          <div className="space-y-2">
            <Label>Reference (Order # / PO #)</Label>
            <Input
              placeholder="e.g. PO-9921 or Found in A-12"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          {/* 4. Current Stats Footer */}
          <div className="bg-slate-50 p-3 rounded-lg text-xs grid grid-cols-2 gap-2 border">
            <div>
              Physical: <strong>{currentPhysical}</strong>
            </div>
            <div>
              Reserved: <strong>{currentReserved}</strong>
            </div>
            <div className="col-span-2 text-blue-600 border-t pt-1">
              Available to Promise: <strong>{availableToPromise}</strong>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleProcess}>Confirm Transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustDialog;
