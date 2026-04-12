

export type PaymentStatus = "PENDING" | "APPROVED" 

export type EventType = "status_change" | "payment_uploaded" | "payment_approved"

export type PaymentType = "SCREENSHOT" | "ADJUSTMENT" | "FINANCE"

export type WarehouseAccessType = "VIEW" | "MANAGE"


export const INVENTORY_TXN_TYPES = [
  { type: "INWARD", label: "Inward" },
  { type: "OUTWARD", label: "Outward" },
  { type: "RESERVE", label: "Reserve" },
  { type: "RELEASE", label: "Release" },
  { type: "TRANSFER_IN", label: "Transfer In" },
  { type: "TRANSFER_OUT", label: "Transfer Out" },
  { type: "ADJUSTMENT", label: "Adjustment" },
  { type: "LOSS", label: "Loss" },
] as const;

export type InventoryTxnType = typeof INVENTORY_TXN_TYPES[number]['type']

export const TRANSFER_STATUS_TYPES = [
  { type: "CREATED", label: "Created" },
  { type: "DISPATCHED", label: "Dispatched" },
  { type: "IN_TRANSIT", label: "In Transit" },
  { type: "PARTIALLY_RECEIVED", label: "Partially Received" },
  { type: "COMPLETED", label: "Completed" },
  { type: "CANCELLED", label: "Cancelled" }
] as const;

export type TransferStatusType = typeof TRANSFER_STATUS_TYPES[number]['type'];

export const PURCHASE_STATUS_TYPE = [
  { type: "CREATED", label: "Created" },
  { type: "CANCELLED", label: "Cancelled" },
  { type: "PARTIALLY_RECEIVED", label: "Partially Received" },
  { type: "COMPLETED", label: "Completed" },
] as const;

export type PurchaseStatusType = typeof PURCHASE_STATUS_TYPE[number]['type']

export interface User {
  id: number;
  trigram: string;
  company: string;
  location?: string | null;
  roleId: number;
  region?: string | null;

  warehouses?: UserWarehouse[]
  transferOrders?: TransferOrder[]
}

export interface Company {
  id: number;
  gstin: string;
  name: string;
  sales?: string | null;
  email?: string | null;
  contactNo?: string | null;
  company_name: string;
  createdAt: string | Date;
  updatedAt?: string | Date | null;
  addresses?: Address[];
  SalesOrder?: SalesOrder[];
}

export interface Address {
  id: number;
  gstin: string;
  addressType: string;
  type: string;
  contactName: string;
  line1: string;
  line2?: string | null;
  city: string;
  pincode: string;
  stateCode: string;
  stateName: string;
  email?: string | null;
  phone: string;
  company_name: string;
  deliveryGstin?: string | null;
}

export interface SalesOrder {
  id: number;
  orderNo: string;
  orderDate: string | Date;
  gstin: string;
  status: number;
  company_name: string;
  totalPrice: number;
  createdAt: string | Date;
  updatedAt?: string | Date | null;
  type_name: string;
  type: string;
  numberItem: number;
  seller: string;
  transportType: string;
  saleman: string;
  revision: number;
  pdf_url?: string | null;
  round_amount?: number | null;
  warehouse?: string | null;
  DateOK?: string | Date | null;
  orderDetails?: OrderDetails[];
  history?: SalesOrderStatusHistory[];
  payments?: SalesPayment[];
}

export interface OrderDetails {
  id: number;
  orderId: string;
  mnId: string;
  quantity: number;
  rateUnit: number;
  taxableAmount: number;
  taxedAmount: number;
  product?: Product;
}

export interface SalesPayment {
  id: number;
  orderNo: string;
  amountPaid: number;
  image_url?: string | null;
  paymentStatus: PaymentStatus;
  paymentType: PaymentType;
  approvedBy?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface SalesOrderStatusHistory {
  id: number;
  orderNo: string;
  status: number;
  modified_at: string | Date;
  transition: string;
  duration_from_start: string;
  duration_from_previous: string;
}

export interface Product {
  id: number;
  brand: string;
  mn: string;
  type?: string | null;
  family?: string | null;
  power?: number | null;
  description: string;
  active: boolean;
  hsn: string;
  initial_stock: number;
  unit_price?: string | null;
  inventory?: WarehouseInventory[];
  productPrice?: ProductPrice;
  transactions?:  InventoryTransaction[]
  transferItems?: TransferItem[]
  orderDetails?: OrderDetails[]
  purchaseOrderItems?: PurchaseOrderItem[]
}

export interface ProductPrice {
  mn: string;
  mrp: number;
  price1: number;
  price2: number;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;

  transactions?: InventoryTransaction[];
  warehouses?: UserWarehouse[];
  inventory?: WarehouseInventory[];

  transfersFrom?: TransferOrder[];
  transfersTo?: TransferOrder[];
  purchaseOrders?: PurchaseOrder[]
}

export interface UserWarehouse {
  userId: number
  warehouseId: number
  accessType: WarehouseAccessType

  user?: User
  warehouse?: Warehouse
}

export interface WarehouseInventory {
  id: number;
  warehouseId: number;
  productMn: string;
  physicalQty: number;
  reservedQty: number;
  minimumQty: number;
  product?: Product;
  warehouse?: Warehouse;
}

export interface InventoryTransaction {
  id: number;
  warehouseId: number;
  warehouseName: string;
  productMn: string;
  qtyChange: number;
  type: InventoryTxnType;
  reference?: string | null;
  createdAt: string | Date;
  createdBy?: string | null;
  
  physicalBefore: number;
  physicalAfter: number;
  reservedBefore: number;
  reservedAfter: number;

  product?:Product;
  warehouse?: Warehouse;
  user?: User;
}

export interface TransferOrder {
  id: number;
  transferNo: string;

  fromWarehouseId: number;
  toWarehouseId: number;
  fromWarehouseName?:string;
  toWarehouseName?:string;
  
  status: TransferStatusType
  createdBy?: string | null

  dispatchedAt?: string | Date;
  receivedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;

  user?: User
  fromWarehouse?: Warehouse; 
  toWarehouse?: Warehouse;
  items?: TransferItem[]

}

export interface TransferItem {
  id: number;
  transferId: number;
  transferNo: string;
  productMn: string;

  requestedQty: number;
  dispatchedQty: number;
  receivedQty: number;

  transfer?: TransferOrder;
  product?: Product

}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  warehouseId: number;
  warehouseName: string;
  supplierId: number;
  supplierName: string
  status: PurchaseStatusType;
  orderDate: string | Date;
  expectedDate: string | Date;
  createdBy: string;
  remarks?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  warehouse?: Warehouse;
  supplier?: Supplier;
  createdByUser?:User;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  productMn: string
  orderedQty: number;
  receivedQty: number;

  createdAt: string | Date;
  purchaseOrder?: PurchaseOrder;
  product?: Product;
}


export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;

  gstNumber?: string;

  deletedAt?: string | null;  
  createdAt: string | Date;
  updatedAt: string | Date;
  purchaseOrders?: PurchaseOrder[]
}
