import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SelectedProductType } from "@/hooks/useTransferOrder";


type Props = {
  products: SelectedProductType[];
  onQtyChange: (productMn: string, qty: number) => void;
  onRemove: (productMn: string) => void;
};

const SelectedProductsTable = ({ products, onQtyChange, onRemove }: Props) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-card">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]">Product MN</TableHead>
            <TableHead className="w-[40%]">Description</TableHead>
            <TableHead className="text-center">Available</TableHead>
            <TableHead className="text-center">Qty</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No products selected
              </TableCell>
            </TableRow>
          )}

          {products.map((item) => (
            <TableRow key={item.productMn}>
              <TableCell className="font-medium">{item.productMn}</TableCell>

              <TableCell className="truncate max-w-[300px]">
                {item.description}
              </TableCell>

              <TableCell className="text-center font-mono text-gray-600">
                {item.availableQty}
              </TableCell>

              <TableCell className="text-center">
                <Input
                  type="number"
                  min={1}
                  max={item.availableQty}
                  value={item.qty}
                  onChange={(e) =>
                    onQtyChange(item.productMn, Number(e.target.value))
                  }
                  className="w-20 text-center mx-auto"
                />
              </TableCell>

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

export default SelectedProductsTable;