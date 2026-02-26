import type { InventoryTxnType } from "@/types/TableTypes";

export const transactionTypeBadge: Record<InventoryTxnType, string> = {
  INWARD: "bg-green-100 text-green-700 border-green-300",
  OUTWARD: "bg-red-100 text-red-700 border-red-300",
  RESERVE: "bg-yellow-100 text-yellow-700 border-yellow-300",
  RELEASE: "bg-blue-100 text-blue-700 border-blue-300",
  TRANSFER_IN: "bg-purple-100 text-purple-700 border-purple-300",
  TRANSFER_OUT: "bg-orange-100 text-orange-700 border-orange-300",
  ADJUSTMENT: "bg-gray-100 text-gray-700 border-gray-300",
};