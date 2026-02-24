import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { InventoryTxnType, WarehouseInventory } from "@/types/TableTypes";
import { api } from "@/lib/api";
import { handleApiError } from "./handleApiError";
import { validateInventoryTransaction } from "@/utils/validateInventoryTxn";

interface AdjustDialogProps {
  selectedProductMn: string | null;
  onClose: () => void;
  onSave: (data: {
    productMn: string;
    warehouseId: number;
    type: string;
    qtyChange: number;
    reference: string;
  }) => void;
}

const StockAdjustDialog = ({ selectedProductMn, onClose, onSave}: AdjustDialogProps) => {
  const [selectedProduct, setSelectedProduct] =useState<WarehouseInventory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [type, setType] = useState<InventoryTxnType>("ADJUSTMENT");
  const [qty, setQty] = useState(0);
  const [reference, setReference] = useState("");
  const [adjSign, setAdjSign] = useState<1 | -1>(1);

  const fetchInventoryStock = async () => {
    try {
      setIsLoading(true);
      console.log(`Calling fetchInventoryStock for ${selectedProductMn}`)

      const res = await api.get("/stock/product", {
        params: { productMn: selectedProductMn },
      });
      console.log("Response for fetchInventoryStock: ", res.data)

      setSelectedProduct(res.data.inventoryProduct);
    } catch (error) {
      console.log("Error occured in fetchInventoryStock: ", error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProductMn) {
      fetchInventoryStock();
    }
  }, [selectedProductMn]);


  const handleClose = () => {
    setSelectedProduct(null);
    setQty(0);
    setReference("");
    onClose();
  };

  
const handleProcess = () => {
  if (!selectedProduct) return;

  const result = validateInventoryTransaction({
    type,
    qty,
    adjSign,
    physicalQty: selectedProduct.physicalQty,
    reservedQty: selectedProduct.reservedQty,
  });

  if (!result.isValid) {
    toast.error(result.error);
    return;
  }
  toast.success('Validation success')

  onSave({
    productMn: selectedProduct.productMn,
    warehouseId: selectedProduct.warehouseId,
    type,
    qtyChange: result.qtyChange,
    reference,
  });
};

  const physical = selectedProduct?.physicalQty ?? 0;
  const reserved = selectedProduct?.reservedQty ?? 0;
  const atp = physical - reserved;


  return (
    <Dialog open={!!selectedProductMn} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Stock Transaction: {selectedProductMn}
          </DialogTitle>
        </DialogHeader>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="py-10 text-center text-gray-800">
            Loading inventory...
          </div>
        )}

        {/* CONTENT */}
        {!isLoading && selectedProduct && (
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
                      variant={adjSign === -1 ? "default" : "outline"}
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

            <div className="bg-slate-50 p-3 rounded text-xs grid grid-cols-2 gap-2 border">
              <div>Physical: <b>{physical}</b></div>
              <div>Reserved: <b>{reserved}</b></div>
              <div className="col-span-2 text-blue-600 border-t pt-1">
                ATP: <b>{atp}</b>
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
            disabled={isLoading || !selectedProduct}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustDialog;
