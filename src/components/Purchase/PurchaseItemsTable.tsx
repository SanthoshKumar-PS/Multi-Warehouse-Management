import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PurchaseOrderItem } from "@/types/TableTypes";
import { useNavigate } from "react-router-dom";

type PurchaseItemsTableProps = {
    purchaseItems: PurchaseOrderItem[];
}
const PurchaseItemsTable = ({purchaseItems}:PurchaseItemsTableProps) => {
    const navigate = useNavigate();
  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-card">
      <Table className="table-auto min-w-[1100px] w-full">
        <TableHeader>
          <TableRow className="[&_th]:py-4 bg-gray-50/50">
            <TableHead className="min-w-[150px]">Product MN</TableHead>
            <TableHead className="min-w-[150px]">Description</TableHead>
            <TableHead className="w-[120px]">Ordered Qty</TableHead>
            <TableHead className="min-w-[120px]">Received Qty</TableHead>
            <TableHead className="min-w-[120px]">Remaining Qty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {purchaseItems.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                        No purchase items found.
                    </TableCell>
                </TableRow>
            ) : (
                purchaseItems.map(purchaseItem => {
                    const remainingQty = purchaseItem.orderedQty - purchaseItem.receivedQty;
                    return (
                        <TableRow
                            key={purchaseItem.id}
                            className="[&_td]:py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                            // onClick={()=>{navigate(`/transfers/${purchaseItem.transferNo}`)}}
                        >
                            <TableCell className="font-mono text-sm font-medium">
                                {purchaseItem.productMn}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 font-medium">
                                {purchaseItem.product?.description}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                {purchaseItem.orderedQty}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                {purchaseItem.receivedQty? purchaseItem.receivedQty : '-'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                {remainingQty? remainingQty : '-'}
                            </TableCell>
                        </TableRow>
                    )
                })
            )}
        </TableBody>

      </Table>
    </div>
  );
};

export default PurchaseItemsTable;
