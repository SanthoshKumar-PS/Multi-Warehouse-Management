import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { InventoryTransaction } from "@/types/TableTypes";
import { transactionTypeBadge } from "@/utils/typeBadge";
import { Badge } from "../ui/badge";
import { formatUtcToIST } from "@/utils/formatUtcToIST";

type TransactionsTableType = {
    inventoryTransactions: InventoryTransaction[],
    showProduct?: boolean
}

const TransactionsTable = ({ inventoryTransactions = [], showProduct = false }: TransactionsTableType) => {
    return (
        <div className="w-full overflow-x-auto rounded-lg border bg-card">
            <Table className="table-auto min-w-[1100px] w-full">
                <TableHeader>
                    <TableRow className="[&_th]:py-4 bg-gray-50/50">
                        {showProduct && (
                            <TableHead className="min-w-[200px]">Product</TableHead>
                        )}
                        <TableHead className="min-w-[160px]">Date</TableHead>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead className="w-[120px]">Qty Change</TableHead>
                        <TableHead className="min-w-[150px]">Physical Qty</TableHead>
                        <TableHead className="min-w-[150px]">Reserved Qty</TableHead>
                        <TableHead className="min-w-[180px]">Reference</TableHead>
                        <TableHead className="min-w-[120px]">Member</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inventoryTransactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={showProduct ? 8 : 7} className="h-24 text-center text-gray-500">
                                No transactions found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        inventoryTransactions.map((tx) => (
                            <TableRow key={tx.id} className="[&_td]:py-4 hover:bg-gray-50/50 transition-colors">
                                {showProduct && (
                                    <TableCell>
                                        <div className="max-w-[250px]">
                                            <p className="font-medium text-gray-800 truncate" title={tx.product?.description ?? "Not Provided"}>
                                                {tx.product?.description ?? "Not Provided"}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{tx.productMn}</p>
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell className="whitespace-nowrap text-sm text-gray-600">
                                    {formatUtcToIST(tx.createdAt)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`${transactionTypeBadge[tx.type]} whitespace-nowrap`}
                                    >
                                        {tx.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className={`font-mono font-semibold ${tx.qtyChange < 0 ? "text-red-600" : "text-emerald-600"}`} >
                                    {tx.qtyChange > 0 ? "+" : ""}
                                    {tx.qtyChange}
                                </TableCell>
                                <TableCell className="text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 font-mono w-8 text-right">
                                            {tx.physicalBefore}
                                        </span>
                                        <span className="text-gray-300">→</span>
                                        <span
                                            className={`px-2 py-0.5 rounded-md text-xs font-bold min-w-[32px] text-center
                                                ${tx.physicalAfter > tx.physicalBefore
                                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                    : tx.physicalAfter < tx.physicalBefore
                                                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                                                        : "text-gray-500 bg-gray-50 border border-gray-100"
                                                }
                                            `}
                                        >
                                            {tx.physicalAfter}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 font-mono w-8 text-right">
                                            {tx.reservedBefore}
                                        </span>
                                        <span className="text-gray-300">→</span>
                                        <span
                                            className={`px-2 py-0.5 rounded-md text-xs font-bold min-w-[32px] text-center
                                                ${tx.reservedAfter > tx.reservedBefore
                                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                                    : tx.reservedAfter < tx.reservedBefore
                                                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                        : "text-gray-500 bg-gray-50 border border-gray-100"
                                                }
                                            `}
                                        >
                                            {tx.reservedAfter}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500 max-w-[200px]">
                                    <p className="truncate">{tx.reference}</p>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 font-medium">
                                    {tx.createdBy ?? "N/A"}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default TransactionsTable;