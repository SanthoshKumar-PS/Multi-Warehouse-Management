import { handleApiError } from "@/components/handleApiError";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthProvider";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowLeftRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRANSFER_STATUS_TYPES, type TransferOrder, type TransferStatusType } from "@/types/TableTypes";
import { useDebounce } from "@/hooks/useDebounce";
import { Spinner } from "@/components/Spinner";
import TransferTable from "@/components/Transfers/TransferTable";

export type DIRECTION_TYPE = 'ALL'|'INBOUND'|'OUTBOUND' 
const Transfers = () => {
    const { selectedWarehouse, hasWarehouseAccess } = useAuth();
    // TODO: Handle Missing Warehouse
    if(!selectedWarehouse) return 
    const canManage = hasWarehouseAccess(selectedWarehouse.warehouseId, 'MANAGE');
    console.log("Can Manage warehouse: ",canManage)
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [transferOrders, setTransferOrders] = useState<TransferOrder[]>([]);
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>('');
    const debouncedSearch = useDebounce(search, 300);
    const [statusFilter, setStatusFilter] = useState<TransferStatusType| 'ALL'>('ALL');
    const [directionFilter, setDirectionFilter] = useState<DIRECTION_TYPE>('ALL');

    const fetchTransferOrder = async () => {
      try {
        setIsLoading(true);
        await new Promise(res => setTimeout(res,1500))
        const response = await api.get('/transfers',{
          params:{
            page, debouncedSearch, statusFilter, directionFilter
          }
        });
        console.log("Transfers response: ",response.data);
        setTransferOrders(response.data.transferOrders);
      } catch (error:any) {
        console.log("Error occured in fetchTransferOrder: ",error);
        handleApiError(error);
      } finally{
        setIsLoading(false);
      }
    }

    useEffect(()=>{
      fetchTransferOrder();
    },[selectedWarehouse.warehouseId, page, debouncedSearch, statusFilter, directionFilter])

    

  return (
    <motion.div
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.25 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Transfers</h1>
          {canManage && (
            <Button onClick={()=>navigate('/transfers/new')}>New Transfer</Button>
          )}
      </div>


      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label htmlFor="Search" className="text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"/>
            <Input 
              placeholder="Transfer No, Product MN ..."
              value={search}
              onChange={(e)=> {setSearch(e.target.value); setPage(1)}}
              className="w-56 pl-8"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="Status" className="text-xs font-medium text-gray-500">Status</label>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as TransferStatusType|'ALL'); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {TRANSFER_STATUS_TYPES.map(transferType => (
                <SelectItem key={transferType.type} value={transferType.type}>{transferType.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="Direction" className="text-xs font-medium text-gray-500">Direction</label>
          <Select value={directionFilter} onValueChange={(v) => {setDirectionFilter(v as DIRECTION_TYPE); setPage(1); }}>
            <SelectTrigger className="w-36"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="OUTBOUND">Outbound</SelectItem>
              <SelectItem value="INBOUND">Inbound</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* Main Content */}
      {isLoading? (
        <div className="flex-1 flex justify-center items-center py-30 md:py-40">
          <Spinner />
        </div>
      ) : transferOrders.length===0? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-12 text-gray-500">
          <ArrowLeftRight className="mb-3 h-10 w-10"/>
          <p className="font-medium">No transfer orders found.</p>
          <p className="text-sm">Try changing the filters applied.</p>
        </div>
      ) : (
        <TransferTable transferOrders={transferOrders}/>
      )}



    </motion.div>
  )
}

export default Transfers