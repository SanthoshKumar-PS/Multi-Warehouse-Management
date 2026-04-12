import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { WarehouseInventory } from "@/types/TableTypes";
import { getStockStatusColor } from "@/utils/getStockStatusColor";

type StockAvailabilityDialogProps = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  stockData: WarehouseInventory[];
};

const StockAvailabilityDialog = ({ open, onClose, loading, stockData }: StockAvailabilityDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Stock Availability</DialogTitle>
          <DialogDescription>
            View stock across all warehouses.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="w-full max-h-[60vh] overflow-y-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="[&_th]:py-4 bg-gray-50/50">
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Physical Qty</TableHead>
                  <TableHead>Reserved Qty</TableHead>
                  <TableHead>Available Qty</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {stockData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-gray-500"
                    >
                      No stock found.
                    </TableCell>
                  </TableRow>
                ) : (
                  stockData.map((stock) => {
                    const availableQty = stock.physicalQty - stock.reservedQty;

                    return (
                      <TableRow key={stock.id}>
                        <TableCell className="font-medium">
                          {stock.warehouse?.name ?? "Not Provided"}
                        </TableCell>

                        <TableCell>{stock.physicalQty}</TableCell>

                        <TableCell>{stock.reservedQty}</TableCell>

                        <TableCell
                          className={`font-semibold ${getStockStatusColor(availableQty)}`}
                        >
                          {availableQty}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockAvailabilityDialog;
