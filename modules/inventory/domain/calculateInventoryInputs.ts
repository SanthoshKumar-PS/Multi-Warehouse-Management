import { InventoryTxnType } from '@prisma/client'

export const calculateInventoryInputs = ( type: InventoryTxnType, physicalQty:number, reservedQty:number,qtyChange: number) => {
  let newPhysical = physicalQty;
  let newReserved = reservedQty;
  console.log("calculateInventoryInputs: ",{  type, physicalQty, reservedQty, qtyChange});

  switch (type) {
    case "INWARD":
    case "TRANSFER_IN":
    case "OUTWARD":
    case "ADJUSTMENT":
      newPhysical = physicalQty + qtyChange;
      break;
    
    case "TRANSFER_OUT":
      newPhysical = physicalQty + qtyChange;
      newReserved = reservedQty + qtyChange;
      break;

    case "RESERVE":
    case "RELEASE":
      newReserved = reservedQty + qtyChange;
      break;
  }

  console.log(`Calculated newPhysical qty:${newPhysical} newReservedQty:${newReserved} `);

  return { newPhysical, newReserved }
};
