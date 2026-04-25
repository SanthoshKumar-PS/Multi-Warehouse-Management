import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/TableTypes";
import { ArrowRight, Package, RefreshCw, Search } from "lucide-react";
import { useState } from "react";


type PurchaseProductDialogProps = {
    open: boolean;
    onClose: ()=>void;
    purchaseProducts: Product[];
    isLoading: boolean;
    onProductClick: (product: Product)=>void;
    reFetchProducts: () => void;
}
const PurchaseProductDialog = ({ open, onClose, purchaseProducts, isLoading, onProductClick, reFetchProducts } : PurchaseProductDialogProps) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const filteredProducts = purchaseProducts.filter(prod => 
        {
            const searchTermLower = searchTerm.trim().toLowerCase()
            return (
                prod.mn.toLowerCase().includes(searchTermLower) ||
                prod.description?.toLowerCase().includes(searchTermLower) ||
                prod.brand?.toLowerCase().includes(searchTermLower) ||
                prod.family?.toLowerCase().includes(searchTermLower)
            )
        }
    )
  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-1 overflow-hidden rounded-2xl">
            <DialogHeader className="p-6 pb-2">
                <div className="flex items-center justify-between">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Select Product to Purchase
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
                        return (
                        <div key={ip.mn} 
                            onClick={() => {
                                onProductClick(ip);
                                onClose();
                            }}
                            className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md hover:shadow-blue-50 cursor-pointer transition-all"
                        >
                            <div className="flex-1 min-w-0 space-y-1">
                                {/* MN + Brand */}
                                <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                                    {ip.mn}
                                </h4>
                                {ip.brand && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                    {ip.brand}
                                    </span>
                                )}
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-500 truncate pr-4">
                                    {ip.description || "No description provided"}
                                </p>

                                {/* Family */}
                                {ip.family && (
                                    <p className="text-xs font-semibold text-gray-800">
                                        {ip.family}
                                    </p>
                                )}
                            </div>

                            {/* Arrow */}
                            <div className="flex items-center">
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                        );
                        })}

                    </div>
                )}
            </div>
        </DialogContent>
    </Dialog>
  )
}

export default PurchaseProductDialog