import type { TransferStatusType } from "@/types/TableTypes";

export const transferStatusBadge: Record<TransferStatusType, string> = {
  CREATED: "bg-gray-100 text-gray-700 border-gray-300",
  DISPATCHED: "bg-blue-100 text-blue-700 border-blue-300",
  IN_TRANSIT: "bg-purple-100 text-purple-700 border-purple-300",
  PARTIALLY_RECEIVED: "bg-yellow-100 text-yellow-700 border-yellow-300",
  COMPLETED: "bg-green-100 text-green-700 border-green-300",
  CANCELLED: "bg-red-100 text-red-700 border-red-300",
};