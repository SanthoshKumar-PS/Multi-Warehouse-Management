import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PurchaseOrderItemInput } from "@/hooks/usePurchaseOrder";
import { Package } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";


type SelectedPurchaseProductTableProps = {
  purchaseProductItems: PurchaseOrderItemInput[];
  onQtyChange: (productMn: string, qty: number) => void;
  onRemove: (productMn: string) => void;
};

const SelectedPurchaseProductTable = ({ purchaseProductItems, onQtyChange, onRemove}: SelectedPurchaseProductTableProps) => {
  if (purchaseProductItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-gray-800">
        <Package className="mb-3 h-10 w-10" />
        <p className="font-medium">No products added yet.</p>
        <p className="text-sm">Click "Add Product" to get started</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-card">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Product MN</TableHead>
            <TableHead className="w-[40%]">Description</TableHead>
            <TableHead className="text-center w-[15%]">Ordered Qty</TableHead>
            <TableHead className="text-right w-[10%]">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {purchaseProductItems.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-6 text-muted-foreground"
              >
                No products selected
              </TableCell>
            </TableRow>
          )}

          {purchaseProductItems.map((item) => (
            <TableRow key={item.productMn}>
              {/* Product MN */}
              <TableCell className="font-medium">{item.productMn}</TableCell>

              {/* Description */}
              <TableCell className="truncate max-w-[200px]">
                {item.productDescription}
              </TableCell>

              {/* Ordered Qty */}
              <TableCell className="text-center">
                <Input
                  type="number"
                  min={1}
                  value={item.orderedQty}
                  onChange={(e) => {
                    const value = Math.max(1, Number(e.target.value) || 1);
                    onQtyChange(item.productMn, value);
                  }}
                  className="w-20 text-center mx-auto"
                />
              </TableCell>

              {/* Action */}
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove(item.productMn)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SelectedPurchaseProductTable;
