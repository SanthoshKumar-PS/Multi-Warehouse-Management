import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import type { PurchaseOrder } from "@/types/TableTypes";
import { formatUtcToIST } from "@/utils/formatUtcToIST";
import { Badge } from "../ui/badge";
import { purchaseStatusBadge } from "@/utils/purchaseStatusBadge";

type PurchaseTableProps = {
  purchaseOrders: PurchaseOrder[];
};

const PurchaseTable = ({ purchaseOrders }: PurchaseTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-card">
      <Table className="table-auto min-w-[1100px] w-full">        
        <TableHeader>
          <TableRow className="[&_th]:py-4 bg-gray-50/50">
            <TableHead className="min-w-[160px]">Date</TableHead>
            <TableHead className="min-w-[150px]">PO No.</TableHead>
            <TableHead className="min-w-[200px]">Supplier</TableHead>
            <TableHead className="min-w-[180px]">Warehouse</TableHead>
            <TableHead className="w-[120px]">Items</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead className="min-w-[140px]">Created By</TableHead>
            <TableHead className="min-w-[160px]">Expected Date</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {purchaseOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                No purchase orders found.
              </TableCell>
            </TableRow>
          ) : (
            purchaseOrders.map((po) => {
              const totalQty = po.items?.reduce(
                (sum, item) => sum + item.orderedQty,
                0
              );

              return (
                <TableRow
                  key={po.id}
                  className="[&_td]:py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => navigate(`/purchase-orders/${po.poNumber}`)}
                >
                  <TableCell className="whitespace-nowrap text-sm text-gray-600">
                    {formatUtcToIST(po.createdAt)}
                  </TableCell>

                  <TableCell className="font-mono text-sm font-medium">
                    {po.poNumber}
                  </TableCell>

                  <TableCell className="text-sm font-medium text-gray-800">
                    {po.supplierName}
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {po.warehouseName}
                  </TableCell>

                  <TableCell className="text-sm">
                    <span className="font-mono font-semibold">
                      {po.items?.length ?? 0}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">
                      ({totalQty ?? 0} units)
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${purchaseStatusBadge[po.status]} whitespace-nowrap`}
                    >
                      {po.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm text-gray-600 font-medium">
                    {po.createdBy}
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-sm text-gray-600">
                    {formatUtcToIST(po.expectedDate)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseTable;
