import { handleApiError } from "@/components/handleApiError";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import { api } from "@/lib/api";
import type { InventoryTransaction, InventoryTxnType, WarehouseInventory } from "@/types/TableTypes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowLeftRight, Box, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import StockAdjustDialog from "@/components/Dialog/StockAdjustDialog";
import { useStockAdjustDialog } from "@/components/Dialog/useStockAdjustDialog";
import { transactionTypeBadge } from "@/utils/typeBadge";

const ProductDetail = () => {
  const { selectedWarehouse, user, hasWarehouseAccess } = useAuth();
  const [inventoryProduct, setInventoryProduct] = useState<WarehouseInventory | null>(null);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { open, inventoryProduct: dialogInventoryProduct, isLoading: dialogLoading, openDialog, closeDialog, submitStockTransaction } = useStockAdjustDialog();
  

  const { productMn } = useParams();
  const navigate = useNavigate();

  // TODO: Handle Missing Warehouse
  if(!selectedWarehouse) return 
  const canManage = hasWarehouseAccess(selectedWarehouse.warehouseId, 'MANAGE')

  const fetchInventoryProduct = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/stock/inventoryProduct', {
        params:{ productMn:productMn }
      })
      console.log("fetchInventoryProduct response: ", response.data);
      setInventoryProduct(response.data.inventoryProduct);
      setInventoryTransactions(response.data.inventoryTransactions)
      
    } catch(error:any){
      console.log("Error occured in fetchInventoryProducts: ", error);
      handleApiError(error);
    } finally{
      setIsLoading(false);
    }
  }

  useEffect(()=>{
    fetchInventoryProduct();
  },[selectedWarehouse])

  if(isLoading){
    return (
      <div className="flex-1 flex justify-center items-center">
        <Spinner />
      </div>
    )
  }

  if(!productMn || !selectedWarehouse || !inventoryProduct){
    return (
      <motion.div
        initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:1 }} 
        className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4"
      >
        <Package className="h-12 w-12"/>
        <p className="text-lg font-medium">Product Not Found.</p>
        <Button variant='outline' onClick={()=>navigate('/inventory')}>
          <ArrowLeft className="mr-2 h-4 w-4"/>Back to Inventory
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.25 }}
    >
      {/* Header */}
      {/* TODO: Adjust Stock */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant='ghost' size='icon' onClick={()=>navigate('/inventory')} aria-label="Back to inventory">
            <ArrowLeft className="h-5 w-5"/>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{inventoryProduct.product?.description}</h1>
            <p>{inventoryProduct.productMn} · {inventoryProduct.product?.family}</p>
          </div>
        </div>

        {canManage && (
          <Button onClick={()=> {
            openDialog(inventoryProduct.productMn)
          }}>
            Adjust Stock
          </Button>
        )}

      </div>

      {/* Stat Card */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Physical Stock</CardTitle>
            <Box className="h-4 w-4 text-gray-500"/>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{inventoryProduct.physicalQty}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Reserved</CardTitle>
            <Box className="h-4 w-4 text-gray-500"/>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{inventoryProduct.reservedQty}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Available</CardTitle>
            <Box className="h-4 w-4 text-gray-500"/>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{inventoryProduct.physicalQty - inventoryProduct.reservedQty}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Transactions</CardTitle>
            <Box className="h-4 w-4 text-gray-500"/>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{inventoryTransactions.length}</p>
          </CardContent>
        </Card>

      </div>

      {/* Transaction History */}
      <h2 className="mb-3 text-lg font-semibold text-gray-500">Transaction History</h2>
      {inventoryTransactions.length ===0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-12 text-gray-500">
          <ArrowLeftRight className="mb-3 h-10 w-10"/>
          <p className="font-medium">No transactions yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="[&_th]:py-4">
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="">Qty Change</TableHead>
                  <TableHead className="">PhysicalQty</TableHead>
                  <TableHead className="">ReservedQty</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Member</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryTransactions.map(tx => (
                <TableRow key={tx.id} className="[&_td]:py-4">
                  <TableCell className="whitespace-nowrap text-sm">{format(new Date(tx.createdAt), 'dd MMM yyyy')}</TableCell>
                  <TableCell><Badge variant='outline' className={transactionTypeBadge[tx.type]}>{tx.type}</Badge></TableCell>
                  <TableCell className={`font-mono ${tx.qtyChange<0 ? 'text-red-500' : 'text-green-500'}`}>
                    {tx.qtyChange>0 ? '+' : '-'}{Math.abs(tx.qtyChange)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-400 font-mono">{tx.physicalBefore}</span>
                      <span className="mx-2 text-gray-300">→</span>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold
                        ${tx.physicalAfter > tx.physicalBefore ? 'bg-emerald-100 text-emerald-700' : 
                          tx.physicalAfter < tx.physicalBefore ? 'bg-rose-100 text-rose-700' : 
                          'text-gray-500 bg-gray-50 border border-gray-100'}
                      `}>
                        {tx.physicalAfter}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-400 font-mono">{tx.reservedBefore}</span>
                      <span className="mx-2 text-gray-300">→</span>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-colors
                        ${tx.reservedAfter > tx.reservedBefore ? 'bg-amber-100 text-amber-700' : 
                          tx.reservedAfter < tx.reservedBefore ? 'bg-blue-100 text-blue-700' : 
                          'text-gray-500 bg-gray-50 border border-gray-100'}
                      `}>
                        {tx.reservedAfter}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{tx.reference}</TableCell>
                  <TableCell className="text-sm text-gray-500">{tx.createdBy??'N/A'}</TableCell>

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
        onSubmit={submitStockTransaction}
      />


    </motion.div>
  )
}

export default ProductDetail