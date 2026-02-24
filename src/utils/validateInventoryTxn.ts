//NOTE:  This ValidateInventory must always be same as in backend/validate/validateInventoryTxn.ts

import type { InventoryTxnType } from "@/types/TableTypes";

type ValidateInput = {
  type: InventoryTxnType;
  qty: number;
  adjSign?: number;
  physicalQty: number;
  reservedQty: number;
};

type ValidateResult = {
  isValid: boolean;
  error?: string;
  qtyChange: number;
};

export function validateInventoryTransaction({
  type,
  qty,
  adjSign = 1,
  physicalQty,
  reservedQty,
}: ValidateInput): ValidateResult {
  const multipliers: Record<InventoryTxnType, number> = {
    RESERVE: 1,
    RELEASE: -1,
    INWARD: 1,
    TRANSFER_IN: 1,
    OUTWARD: -1,
    TRANSFER_OUT: -1,
    ADJUSTMENT: adjSign,
  };

  const qtyChange = qty * (multipliers[type] || 1);

  const atp = physicalQty - reservedQty;

  let error = "";

  switch (type) {
    case "RESERVE":
      if (qty > atp) error = `Only ${atp} available to promise`;
      break;

    case "RELEASE":
      if (qty > reservedQty) error = `Only ${reservedQty} reserved`;
      break;

    case "OUTWARD":
    case "TRANSFER_OUT":
      if (qty > atp) error = "Not enough available stock";
      break;

    case "ADJUSTMENT":
      if (physicalQty + qtyChange < reservedQty)
        error = "Cannot reduce below reserved stock";
      break;

    case "INWARD":
    case "TRANSFER_IN":
      // always allowed
      break;
  }

  if(qtyChange===0) error = `Quantity cannot be zero`

  return {
    isValid: !error,
    error: error || undefined,
    qtyChange,
  };
}