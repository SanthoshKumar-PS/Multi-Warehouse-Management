import type { PurchaseStatusType } from "@/types/TableTypes";

export const purchaseStatusBadge: Record<PurchaseStatusType, string> = {
  CREATED: "bg-blue-100 text-blue-700 border-blue-300",
  CANCELLED: "bg-red-100 text-red-700 border-red-300",
  PARTIALLY_RECEIVED: "bg-yellow-100 text-yellow-700 border-yellow-300",
  COMPLETED: "bg-green-100 text-green-700 border-green-300",
};
