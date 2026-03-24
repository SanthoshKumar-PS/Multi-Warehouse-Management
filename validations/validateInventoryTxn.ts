//NOTE:  This ValidateInventory must always be same as in frontend/src/utils/validate/validateInventoryTxn.ts
import { InventoryTxnType } from '@prisma/client'

type BackendValidateInput = {
  type: InventoryTxnType;
  qtyChange: number;
  physicalQty: number;
  reservedQty: number;
};

type BackendValidateResult = {
  isValid: boolean;
  error?: string;
};

export function validateInventoryTransaction({
  type,
  qtyChange,
  physicalQty,
  reservedQty
}: BackendValidateInput): BackendValidateResult {

  const newPhysical = physicalQty + qtyChange;

  const atp = physicalQty - reservedQty;

  let error = "";

  console.log("Validate inventory transaction ");
  console.log({  type,
  qtyChange,
  physicalQty,
  reservedQty});

  switch (type) {
    case "RESERVE":
      if (qtyChange <= 0) error = "Reserve must increase reserved stock";
      if (qtyChange > atp)
        error = "Not enough available stock to reserve";
      break;

    case "RELEASE":
      if (qtyChange >= 0)
        error = "Release must reduce reserved stock"
      if (Math.abs(qtyChange) > reservedQty)
        error = "Cannot release more than reserved";
      break;

    case "INWARD":
      if (qtyChange <= 0)
        error = "Inward must increase physical stock";
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
      break

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

  if (qtyChange === 0) error = "Quantity cannot be zero";

  return {
    isValid: !error,
    error: error || undefined,
  };
}