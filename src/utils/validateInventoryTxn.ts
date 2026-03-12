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

  const newPhysical = physicalQty + qtyChange;

  let error = "";

  switch (type) {
    case "RESERVE":
      if (qtyChange <= 0) error = "Reserve must increase reserved stock";
      if (qtyChange > atp) error = `Only ${atp} available to promise`;
      break;

    case "RELEASE":
      if(qtyChange >=0 ) error = "Release must reduce reserved stock"
      if (Math.abs(qtyChange) > reservedQty) error = `Only ${reservedQty} reserved`;
      break;

    case "INWARD":
      if(qtyChange <= 0)
        error = "Inward must increase physical stock.";
      break;

    case "OUTWARD":
      if (qtyChange >= 0)
        error = "Outward must reduce physical stock"
      if(Math.abs(qtyChange)>atp)
        error = "Not enough available stock";
      break;

    case "TRANSFER_IN":
      if (qtyChange <= 0)
        error = "Transfer in must increase physical stock";
      break;

    case "TRANSFER_OUT":
      if (qtyChange >= 0)
        error = "Transfer out must reduce stock"

      if (Math.abs(qtyChange) > reservedQty)
        error = "Cannot transfer more than reserved stock"
      break;

    case "ADJUSTMENT":
      if (newPhysical < reservedQty)
        error = "Cannot reduce below reserved stock";
      break;

  }

  if(qtyChange===0) error = `Quantity cannot be zero`

  return {
    isValid: !error,
    error: error || undefined,
    qtyChange,
  };
}