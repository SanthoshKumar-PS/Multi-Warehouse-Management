
export type PaymentStatus = "PENDING" | "APPROVED" 

export type EventTpe = "status_change" | "payment_uploaded" | "payment_approved"

export type PaymentType = "SCREENSHOT" | "ADJUSTMENT" | "FINANCE"

export type WarehouseAccessType = "VIEW" | "MANAGE"

export type InventoryTxnType = "INWARD" | "OUTWARD" | "RESERVE" | "RELEASE" | "TRANSFER_IN" | "TRANSFER_OUT" | "ADJUSTMENT"


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
  inventory?: WarehouseInventory[];
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
  createdAt: string | Date;
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

export interface User {
  id: number;
  trigram: string;
  company: string;
  location?: string | null;
  roleId: number;
  region?: string | null;
}