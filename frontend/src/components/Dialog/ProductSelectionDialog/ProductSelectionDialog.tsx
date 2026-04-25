import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { InventoryTxnType, WarehouseInventory } from "@/types/TableTypes";
import { api } from "@/lib/api";
import { validateInventoryTransaction } from "@/utils/validateInventoryTxn";
import { handleApiError } from "../../handleApiError";
import { ArrowRight, Package, RefreshCw, Search } from "lucide-react";

type ProductSelectionDialogProps = {
    open: boolean,
    onClose: () => void,
    isLoading: boolean,
    inventoryProducts: WarehouseInventory[],
    onProductClick: (product: WarehouseInventory) =>void;
    reFetchProducts: ()=> void;
}

const ProductSelectionDialog = ({ open, onClose, isLoading, inventoryProducts, onProductClick, reFetchProducts } : ProductSelectionDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = inventoryProducts.filter(ip => 
    ip.productMn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ip.product?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-1 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Select Product to Transfer
            </DialogTitle>
            <RefreshCw onClick={reFetchProducts} />
          </div>
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by MN or description..."
              className="pl-10 h-11 bg-gray-50 border-gray-200 focus:ring-blue-500 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
               <p className="text-sm text-gray-500">Loading inventory...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <p className="text-gray-500 font-medium">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredProducts.map((ip) => {
                const availableQty = ip.physicalQty - ip.reservedQty;
                return (
                  <div 
                    key={ip.productMn} 
                    onClick={() => {
                        onProductClick(ip);
                        onClose();
                    }}
                    className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md hover:shadow-blue-50 cursor-pointer transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {ip.productMn}
                      </h4>
                      <p className="text-sm text-gray-500 truncate pr-4">
                        {ip.product?.description || "No description provided"}
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-bold ${availableQty > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {availableQty} Available
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                          Stock: {ip.physicalQty} | Res: {ip.reservedQty}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-gray-50 border-t">
          <Button variant="ghost" onClick={onClose} className="rounded-lg">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelectionDialog