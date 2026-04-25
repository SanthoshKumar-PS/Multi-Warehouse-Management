import type { Product, WarehouseInventory } from "@/types/TableTypes";

export const extractInventoryFilters = (inventory:WarehouseInventory[]) => {
    const brands = new Set<string>();
    const families = new Set<string>();
    const types = new Set<string>();

    inventory.forEach(item=>{
        if(item.product?.brand) brands.add(item.product.brand);
        if(item.product?.family) families.add(item.product.family);
        if(item.product?.type) types.add(item.product.type);
    })

    return ({
        brands: Array.from(brands).sort(),
        families: Array.from(families).sort(),
        types: Array.from(types).sort()
    })
}