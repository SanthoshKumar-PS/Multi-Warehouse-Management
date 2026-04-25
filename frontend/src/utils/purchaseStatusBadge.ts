import type { PurchaseStatusType } from "@/types/TableTypes";

export const purchaseStatusBadge: Record<PurchaseStatusType, string> = {
  CREATED: "bg-blue-100 text-blue-700 border-blue-300",
  PARTIALLY_RECEIVED: "bg-amber-100 text-amber-700 border-amber-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  CLOSED: "bg-orange-100 text-orange-700 border-orange-300",
  CANCELLED: "bg-red-100 text-red-700 border-red-300",
};
