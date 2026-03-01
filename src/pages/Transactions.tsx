import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider"
import { motion } from "framer-motion";
import { ArrowLeftRight, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { INVENTORY_TXN_TYPES, type InventoryTransaction, type InventoryTxnType } from "@/types/TableTypes";
import { handleApiError } from "@/components/handleApiError";
import { api } from "@/lib/api";
import TransactionsTable from "@/components/Transactions/TransactionsTable";
import { Spinner } from "@/components/Spinner";
import { usePagination } from "@/components/Pagination/usePagination";
import Pagination from "@/components/Pagination/Pagination";
import { useDebounce } from "@/hooks/useDebounce";


const Transactions = () => {
  const { selectedWarehouse, user, hasWarehouseAccess } = useAuth();
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 300);
  const [txnType, setTxnType] = useState<InventoryTxnType | 'ALL'>('ALL')
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { page, setPage, totalPages, setTotalPages, limit, setLimit } = usePagination();


  const fetchInventoryTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/inventoryTransactions',{
        params:{
          debouncedSearch,
          txnType,
          dateFrom,
          dateTo,
          page,
          limit
        }
      })
      console.log("fetchInventoryTransactions response: ", response.data);
      setInventoryTransactions(response.data.inventoryTransactions);
      setTotalPages(response.data.totalPages);
    } catch (error:any) {
      console.log("Error occured while fetchInventoryTransactions: ",error);
      handleApiError(error);
    } finally{
      setIsLoading(false);
    }
  }

  useEffect(()=>{
    fetchInventoryTransactions();
  },[selectedWarehouse,debouncedSearch, txnType, dateFrom, dateTo, page, limit])


  return (
    <motion.div 
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.25 }}
      className="space-y-4 md:space-y-6"
    >
      <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>

      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label htmlFor="Search Product" className="text-xs font-medium text-gray-500">Search Products</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"/>
            <Input 
              placeholder="Search by related fields..."
              value={search}
              onChange={(e) => {setSearch(e.target.value); setPage(1)}}
              className="min-w-48 px-8"
              aria-label="Search product"
            />
            <X className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 hover:cursor-pointer" onClick={()=>setSearch("")} />
          </div>

        </div>
      

        <div className="grid gap-1.5">
          <label htmlFor="Type" className="text-xs font-medium text-gray-500">Type</label>
          <Select value={txnType} onValueChange={(e) => { setTxnType(e as InventoryTxnType | "ALL"); setPage(1); }}>
            <SelectTrigger className="w-36" aria-label="Filter by transaction type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent side="bottom">
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
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            onKeyDown={(e) => e.preventDefault()}
            className="w-40"
            aria-label="Date From"
          />
        </div>
        
        <div className="grid gap-1.5">
          <label htmlFor="To" className="text-xs font-medium text-gray-500">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            onKeyDown={(e) => e.preventDefault()}
            className="w-40" 
            aria-label="Date To"
          />
        </div>
      </div>

      {isLoading? (
        <div className="flex-1 flex justify-center items-center py-30 md:py-40">
          <Spinner />
        </div>
      ) : inventoryTransactions.length ===0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-12 text-gray-500">
          <ArrowLeftRight className="mb-3 h-10 w-10"/>
          <p className="font-medium">No transactions found.</p>
          <p className="font-medium">Try changing the filters applied.</p>
        </div>
      ) : (
        <TransactionsTable inventoryTransactions={inventoryTransactions} showProduct={true}/>
      )}


      {/* Pagination */}
      <Pagination
        page={page} 
        setPage={setPage} 
        totalPages={totalPages} 
        limit={limit}
        setLimit={setLimit} 
        totalRows={inventoryTransactions.length}
      />

    </motion.div>
    
  )
}

export default Transactions