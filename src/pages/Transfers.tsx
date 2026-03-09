import { handleApiError } from "@/components/handleApiError";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthProvider";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRANSFER_STATUS_TYPES, type TransferStatusType } from "@/types/TableTypes";

const Transfers = () => {
    const { selectedWarehouse, hasWarehouseAccess } = useAuth();
    // TODO: Handle Missing Warehouse
    if(!selectedWarehouse) return 
    const canManage = hasWarehouseAccess(selectedWarehouse.warehouseId, 'MANAGE');
    console.log("Can Manage warehouse: ",canManage)
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<TransferStatusType| 'ALL'>('ALL');

    const fetchTransferOrder = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/transfers');
        console.log("Transfers response: ",response.data);
      } catch (error:any) {
        console.log("Error occured in fetchTransferOrder: ",error);
        handleApiError(error);
      } finally{
        setIsLoading(false);
      }
    }

    useEffect(()=>{
      fetchTransferOrder();
    },[])

    

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

        </div>

      </div>


    </motion.div>
  )
}

export default Transfers