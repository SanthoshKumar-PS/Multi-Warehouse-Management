export type UserType = 'STAFF' | 'CUSTOMER'

export type UserRole = 'customer' | 'salesman' | 'warehouse' | 'manager' | 'finance' | 'head' 

export type AvailablePermission = 
    | 'view_all_customers' 
    | 'view_own_customers' 
    | 'view_payments' 
    | 'manage_payments' 
    | 'view_product_prices' 
    | 'manage_product_prices' 
    | 'view_warehouse' 
    | 'manage_warehouse' 
    | 'view_self_data' //For customers only