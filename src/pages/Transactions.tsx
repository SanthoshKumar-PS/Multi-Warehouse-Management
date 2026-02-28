import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthProvider"
import { motion } from "framer-motion";
import { ArrowLeftRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { INVENTORY_TXN_TYPES, type InventoryTransaction, type InventoryTxnType } from "@/types/TableTypes";
import { handleApiError } from "@/components/handleApiError";
import { api } from "@/lib/api";
import TransactionsTable from "@/components/Transactions/TransactionsTable";


const Transactions = () => {
  const { selectedWarehouse, user, hasWarehouseAccess } = useAuth();
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<InventoryTxnType | 'ALL'>('ALL')
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [referenceSearch, setReferenceSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const fetchInventoryTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/inventoryTransactions')
      console.log("fetchInventoryTransactions response: ", response.data);
      setInventoryTransactions(response.data.inventoryTransactions);
    } catch (error:any) {
      console.log("Error occured while fetchInventoryTransactions: ",error);
      handleApiError(error);
    } finally{
      setIsLoading(false);
    }
  }

  useEffect(()=>{
    fetchInventoryTransactions();
  },[])


  return (
    <motion.div 
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.25 }}
    >
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Warehouse Inventory</h1>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label htmlFor="Search Product" className="text-xs font-medium text-gray-500">Search Products</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"/>
            <Input 
              placeholder="Product MN or any product related fields..."
              value={search}
              onChange={(e) => {setSearch(e.target.value); setPage(1)}}
              className="min-w-48 pl-8"
              aria-label="Search product"
            />
          </div>

        </div>
      
        <div className="grid gap-1.5">
          <label htmlFor="Reference" className="text-xs font-medium text-gray-500">Reference</label>
          <Input
            placeholder="Reference...."
            value={referenceSearch}
            onChange={(e)=>{setReferenceSearch(e.target.value); setPage(1);}}
            className="w-36"
            aria-label="Search reference"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="Type" className="text-xs font-medium text-gray-500">Type</label>
          <Select value={typeFilter} onValueChange={(e) => { setTypeFilter(e as InventoryTxnType | "ALL"); setPage(1); }}>
            <SelectTrigger className="w-36" aria-label="Filter by transaction type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {INVENTORY_TXN_TYPES.map( TXN =>(
                <SelectItem value={TXN.type} key={TXN.type}>{TXN.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="From" className="text-xs font-medium text-gray-500">From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="w-40" aria-label="Date From"
          />
        </div>
        
        <div className="grid gap-1.5">
          <label htmlFor="To" className="text-xs font-medium text-gray-500">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="w-40" aria-label="Date To"
          />
        </div>
      </div>


      {inventoryTransactions.length ===0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-12 text-gray-500">
          <ArrowLeftRight className="mb-3 h-10 w-10"/>
          <p className="font-medium">No transactions yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <TransactionsTable inventoryTransactions={inventoryTransactions}/>
        </div>
      )}
      

    </motion.div>
    
  )
}

export default Transactions