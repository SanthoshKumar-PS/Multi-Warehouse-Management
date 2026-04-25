import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TransferItem } from "@/types/TableTypes";
import { useNavigate } from "react-router-dom";

type TransferItemsTableProps = {
    transferItems: TransferItem[];
}
const TransferItemsTable = ({transferItems}:TransferItemsTableProps) => {
    const navigate = useNavigate();
  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-card">
      <Table className="table-auto min-w-[1100px] w-full">
        <TableHeader>
          <TableRow className="[&_th]:py-4 bg-gray-50/50">
            <TableHead className="min-w-[150px]">Product MN</TableHead>
            <TableHead className="w-[120px]">Requested Qty</TableHead>
            <TableHead className="w-[120px]">Dispatched Qty</TableHead>
            <TableHead className="min-w-[120px]">Received Qty</TableHead>
            <TableHead className="min-w-[120px]">Lost Qty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {transferItems.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                        No transfers found.
                    </TableCell>
                </TableRow>
            ) : (
                transferItems.map(transferItem => {
                    const lostQty = transferItem.dispatchedQty - transferItem.receivedQty;
                    return (
                        <TableRow
                            key={transferItem.id}
                            className="[&_td]:py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                            // onClick={()=>{navigate(`/transfers/${transferItem.transferNo}`)}}
                        >
                            <TableCell className="font-mono text-sm font-medium">
                                {transferItem.productMn}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 font-medium">
                                {transferItem.requestedQty}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                {transferItem.dispatchedQty? transferItem.dispatchedQty : '-'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                {transferItem.receivedQty? transferItem.receivedQty : '-'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                {transferItem.receivedQty? lostQty : '-'}
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

export default TransferItemsTable;
