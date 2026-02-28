import { useAuth } from "@/context/AuthProvider"
import type { InventoryTransaction, WarehouseInventory } from "@/types/TableTypes";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PackageOpen, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { handleApiError } from "@/components/handleApiError";
import { extractInventoryFilters } from "@/utils/extractInventoryFilters";
import { Input } from "@/components/ui/input";
import StockAdjustDialog, { type StockTransactionInput } from "@/components/Dialog/StockAdjustDialog";
import { useStockAdjustDialog } from "@/components/Dialog/useStockAdjustDialog";


const Inventory = () => {
  const { selectedWarehouse, user, hasWarehouseAccess } = useAuth();
  const [inventoryProducts, setInventoryProducts] = useState<WarehouseInventory[]>([]);
  const { open, inventoryProduct: dialogInventoryProduct, isLoading: dialogLoading, openDialog, closeDialog, submitStockTransaction } = useStockAdjustDialog();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  const handleSubmitStockTransaction = async (data: StockTransactionInput) => {
    const result = await submitStockTransaction(data);
    if(!result) return
    const { updatedInventoryProduct: updated, createdTransaction } = result;
    console.log("Optimistic update for physicalQty and reservedQty only: ", updated)
    setInventoryProducts(prev => prev.map(ip =>(
      ip.productMn===updated.productMn && ip.warehouseId===updated.warehouseId 
        ? {...ip, physicalQty:updated.physicalQty, reservedQty:updated.reservedQty} : ip
    )))
  }

  // TODO: Handle Missing Warehouse
  if(!selectedWarehouse) return 
  const canManage = hasWarehouseAccess(selectedWarehouse.warehouseId, 'MANAGE')
  console.log("Can Manage warehouse: ",canManage)

  const fetchInventoryProducts = async () =>{
    try{
      setIsLoading(true);
      const response = await api.get('/stock')
      console.log("Fetch response: ", response.data);
      setInventoryProducts(response.data.products);

    } catch(error:any){
      console.log("Error occured in fetchInventoryProducts: ", error);
      handleApiError(error);
    } finally{
      setIsLoading(false);
    }
  }

  useEffect(()=> {
    console.log("Selected Warehouse changed to :", selectedWarehouse);
    fetchInventoryProducts();
  },[selectedWarehouse])

  const filters = useMemo(()=>{
    console.log("Inventory Products Filters: ",extractInventoryFilters(inventoryProducts))
    return extractInventoryFilters(inventoryProducts)
  },[inventoryProducts]);

  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

const filteredInventoryProducts = useMemo(() => {
  return inventoryProducts.filter(item => {
    const p = item.product;
    if (!p) return false;

    const matchesBrand =
      selectedBrand === "all" || p.brand === selectedBrand;

    const matchesFamily =
      selectedFamily === "all" || p.family === selectedFamily;

    const matchesType =
      selectedType === "all" || p.type === selectedType;

    const matchesSearch =
      search === "" ||
      p.mn?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());

    return (
      matchesBrand &&
      matchesFamily &&
      matchesType &&
      matchesSearch
    );
  });
}, [inventoryProducts, selectedBrand, selectedFamily, selectedType, search]);

  

  if(isLoading){
    return (
      <div className="flex-1 flex justify-center items-center">
        <Spinner />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.25 }}
    >
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Warehouse Inventory</h1>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"/>
          <Input
            placeholder="Search product..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type Filter */}
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Types"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {filters.types.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Brand Filter */}
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Brands"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {filters.brands.map(b => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Family Filter */}
        <Select value={selectedFamily} onValueChange={setSelectedFamily}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Family"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Family</SelectItem>
            {filters.families.map(f => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>

      {filteredInventoryProducts.length===0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <PackageOpen className="mb-4 h-12 w-12"/>
          <p className="text-lg font-medium">No Data Found.</p>
          <p className="text-sm">No inventory records for this warehouse.</p>
          <p className="text-sm">Try adjusting the filters if any.</p>
        </div>

      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%] md:w-[40%]">Product</TableHead>
                <TableHead className='text-right'>Physical</TableHead>
                <TableHead className='text-right'>Reserved</TableHead>
                <TableHead className='text-right'>Available</TableHead>
                {canManage && <TableHead className='text-right'>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventoryProducts.map(row => (
                <TableRow
                  key={row.productMn}
                  className="cursor-pointer hover:bg-gray-200/50" 
                  onClick={()=> navigate(`/inventory/${row.productMn}`)}
                >
                  <TableCell className="py-4 w-[60%] md:w-[40%]">
                    <p className="font-medium text-gray-800 truncate">{row.product?.description??"Not Provided"}</p>
                    <p className="text-xs text-gray-500">{row.productMn}</p>
                  </TableCell>
                  <TableCell className="py-4 text-right font-mono">{row.physicalQty}</TableCell>
                  <TableCell className="py-4 text-right font-mono">{row.reservedQty}</TableCell>
                  <TableCell className="py-4 text-right font-mono">{row.physicalQty - row.reservedQty}</TableCell>
                  {canManage && (
                    <TableCell className="py-4 text-right">
                      <Button size='sm' variant='outline' 
                        onClick={(e)=>{
                          e.stopPropagation();
                          console.log("Clicked on adjust for ",row.productMn)
                          openDialog(row.productMn)
                        }}
                      >
                        Adjust
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <StockAdjustDialog 
        open={open} 
        inventoryProduct={dialogInventoryProduct} 
        loading={dialogLoading} 
        onClose={closeDialog} 
        onSubmit={handleSubmitStockTransaction}
      />

    </motion.div>
  )
}

export default Inventory