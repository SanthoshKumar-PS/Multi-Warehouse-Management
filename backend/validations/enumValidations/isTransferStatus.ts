import { TransferStatus } from '@prisma/client'

const transferStatusValues = Object.values(TransferStatus)

export function isTransferStatus(value:unknown) : value is TransferStatus {
    return transferStatusValues.includes(value as TransferStatus);
}