import { handleApiError } from "@/components/handleApiError";
import Pagination from "@/components/Pagination/Pagination";
import { usePagination } from "@/components/Pagination/usePagination";
import PurchaseTable from "@/components/Purchase/PurchaseTable";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthProvider"
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/api";
import { PURCHASE_STATUS_TYPES, type PurchaseOrder, type PurchaseStatusType } from "@/types/TableTypes";
import { motion } from "framer-motion";
import { ArrowLeftRight, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PurchaseOrders = () => {
    const { selectedWarehouse, hasWarehouseAccess } = useAuth();
    // TODO: Handle Missing Warehouse
    if(!selectedWarehouse) return
    const canManage = hasWarehouseAccess(selectedWarehouse.warehouseId, 'MANAGE');
    console.log("Can Manage warehouse: ",canManage)
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [search, setSearch] = useState<string>('');
    const debouncedSearch = useDebounce(search, 300);
    const [statusFilter, setStatusFilter] = useState<PurchaseStatusType | 'ALL'>('ALL');

    const { page, setPage, totalPages, setTotalPages, limit, setLimit } = usePagination();

    const fetchPurchaseOrders = async (signal?:AbortSignal) => {
        try {
            setIsLoading(true);
            const response = await api.get('/purchase-orders',{
                params:{
                    debouncedSearch, statusFilter, page, limit
                },
                signal: signal
            })
            console.log("Purchase orders response: ",response.data);
            setPurchaseOrders(response.data.purchaseOrders);
            setTotalPages(response.data.totalPages);
        } catch (error:any) {
            if(error.name==='CanceledError' || error.name==='AbortError') return;
            console.log("Error occured in fetchPurchaseOrders: ",error);
            handleApiError(error);            
        } finally{
            if(!signal?.aborted){
                setIsLoading(false);
            }
        }
    }

    useEffect(()=> {
        const controller = new AbortController();
        fetchPurchaseOrders(controller.signal);

        return () => {
            controller.abort();
        }
    },[selectedWarehouse?.warehouseId, debouncedSearch, statusFilter, page, limit])
  return (
    <motion.div
        initial={{opacity:0, y:10 }}
        animate={{opacity:1, y:0 }}
        transition={{ duration:0.25 }}
        className="space-y-4"
    >
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Purchase Orders</h1>
            {canManage && (
                <Button onClick={()=> navigate('/purchase-orders/new')}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Create Purchase order
                </Button>
            )}
        </div>

        {/* Search and filters */}
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
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as PurchaseStatusType|'ALL'); setPage(1); }}>
                <SelectTrigger className="w-44"><SelectValue/></SelectTrigger>
                <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                {PURCHASE_STATUS_TYPES.map(transferType => (
                    <SelectItem key={transferType.type} value={transferType.type}>{transferType.label}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        </div>

        {/* Main Content */}
        {isLoading? (
            <div className="flex-1 flex justify-center items-center py-30 md:py-40">
                <Spinner />
            </div>
        ) : purchaseOrders.length===0? (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-white py-12 text-gray-500">
                <ArrowLeftRight className="mb-3 h-10 w-10"/>
                <p className="font-medium">No purchase orders found.</p>
                <p className="text-sm">Try changing the filters applied.</p>
            </div>
        ) : (
            <PurchaseTable purchaseOrders={purchaseOrders}/>
        )}

        <Pagination
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            limit={limit}
            setLimit={setLimit}
            totalRows={purchaseOrders.length}
        />

    </motion.div>
  )
}

export default PurchaseOrders