import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthProvider";
import type { TransferOrder } from "@/types/TableTypes";
import { formatUtcToIST } from "@/utils/formatUtcToIST";
import { Badge } from "../ui/badge";
import { transferStatusBadge } from "@/utils/transferStatusBadge";
import { useNavigate } from "react-router-dom";

type TransferTableProps = {
    transferOrders: TransferOrder[];
}
const TransferTable = ({transferOrders}:TransferTableProps) => {
    const { selectedWarehouse } = useAuth();
    const navigate = useNavigate();
  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-card">
      <Table className="table-auto min-w-[1100px] w-full">
        <TableHeader>
          <TableRow className="[&_th]:py-4 bg-gray-50/50">
            <TableHead className="min-w-[160px]">Date</TableHead>
            <TableHead className="min-w-[150px]">Transfer No.</TableHead>
            <TableHead className="min-w-[200px]">From → To</TableHead>
            <TableHead className="w-[120px]">Items</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="min-w-[120px]">Created By</TableHead>
            <TableHead className="min-w-[160px]">Dispatch At</TableHead>
            <TableHead className="min-w-[160px]">Received At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {transferOrders.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                        No transfers found.
                    </TableCell>
                </TableRow>
            ) : (
                transferOrders.map(transferOrder => {
                    const isOutBound = selectedWarehouse?.warehouseId===transferOrder.fromWarehouseId;
                    const totalQty = transferOrder.items?.reduce((sum,item) => sum+item.requestedQty , 0);
                    return (
                        <TableRow
                            key={transferOrder.id}
                            className="[&_td]:py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                            onClick={()=>{navigate(`/transfers/${transferOrder.transferNo}`)}}
                        >
                            <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                {formatUtcToIST(transferOrder.createdAt)}
                            </TableCell>
                            <TableCell className="font-mono text-sm font-medium">
                                {transferOrder.transferNo}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className={isOutBound ? 'font-bold text-gray-800' : 'text-gray-500'}>
                                        {transferOrder.fromWarehouseName ?? 'N/A'}
                                    </span>
                                    <span className="text-gray-300">→</span>
                                    <span className={!isOutBound ? 'font-bold text-gray-800' : 'text-gray-500'}>
                                        {transferOrder.toWarehouseName ?? 'N/A'}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className=" text-sm">
                                <span className="font-mono font-semibold">{transferOrder.items?.length}</span>
                                <span className="ml-1 text-xs text-gray-500">({totalQty} units)</span>
                            </TableCell>
                            <TableCell>
                                <Badge variant='outline' className={`${transferStatusBadge[transferOrder.status]} whitespace-nowrap`}>
                                    {transferOrder.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 font-medium">
                                {transferOrder.createdBy ?? '-'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                {transferOrder.dispatchedAt?formatUtcToIST(transferOrder.dispatchedAt):'-'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                {transferOrder.receivedAt?formatUtcToIST(transferOrder.receivedAt):'-'}
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

export default TransferTable;
