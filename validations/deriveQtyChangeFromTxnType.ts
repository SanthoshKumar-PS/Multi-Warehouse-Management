import { InventoryTxnType } from '@prisma/client'

export const deriveQtyChangeFromTxnType = (type: InventoryTxnType, qty: number, adjSign: 1 | -1 = 1) => {
    const multipliers: Record<InventoryTxnType, number> = {
    RESERVE: 1,
    RELEASE: -1,
    INWARD: 1,
    TRANSFER_IN: 1,
    OUTWARD: -1,
    TRANSFER_OUT: -1,
    ADJUSTMENT: adjSign
    }

    const qtyChange = qty * multipliers[type]

    return qtyChange
}
