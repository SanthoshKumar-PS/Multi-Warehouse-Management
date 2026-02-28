import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { InventoryTransaction } from "@/types/TableTypes";
import { transactionTypeBadge } from "@/utils/typeBadge";
import { format } from "date-fns";
import { Badge } from "../ui/badge";

type TransactionsTableType = {
    inventoryTransactions: InventoryTransaction[]
}
const TransactionsTable = ({inventoryTransactions = []}:TransactionsTableType) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="[&_th]:py-4">
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="">Qty Change</TableHead>
          <TableHead className="">PhysicalQty</TableHead>
          <TableHead className="">ReservedQty</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Member</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventoryTransactions.map((tx) => (
          <TableRow key={tx.id} className="[&_td]:py-4">
            <TableCell className="whitespace-nowrap text-sm">
              {format(new Date(tx.createdAt), "dd MMM yyyy")}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={transactionTypeBadge[tx.type]}
              >
                {tx.type}
              </Badge>
            </TableCell>
            <TableCell
              className={`font-mono ${tx.qtyChange < 0 ? "text-red-500" : "text-green-500"}`}
            >
              {tx.qtyChange > 0 ? "+" : "-"}
              {Math.abs(tx.qtyChange)}
            </TableCell>
            <TableCell className="text-sm">
              <div className="flex items-center">
                <span className="text-gray-400 font-mono">
                  {tx.physicalBefore}
                </span>
                <span className="mx-2 text-gray-300">→</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-semibold
                        ${
                          tx.physicalAfter > tx.physicalBefore
                            ? "bg-emerald-100 text-emerald-700"
                            : tx.physicalAfter < tx.physicalBefore
                              ? "bg-rose-100 text-rose-700"
                              : "text-gray-500 bg-gray-50 border border-gray-100"
                        }
                      `}
                >
                  {tx.physicalAfter}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-sm">
              <div className="flex items-center">
                <span className="text-gray-400 font-mono">
                  {tx.reservedBefore}
                </span>
                <span className="mx-2 text-gray-300">→</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-colors
                        ${
                          tx.reservedAfter > tx.reservedBefore
                            ? "bg-amber-100 text-amber-700"
                            : tx.reservedAfter < tx.reservedBefore
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-500 bg-gray-50 border border-gray-100"
                        }
                      `}
                >
                  {tx.reservedAfter}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {tx.reference}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {tx.createdBy ?? "N/A"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TransactionsTable;
