import { useAuth, type WarehouseAccess } from "@/context/AuthProvider";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Warehouse, LogOut, MapPin, LayoutDashboard, Package, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWarehouseEmoji } from "@/utils/getWarehouseEmoji";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/low-stock", label: "Low Stock", icon: AlertTriangle },
];
const Navbar = () => {
    const {user, selectedWarehouse, setSelectedWarehouse, logout} = useAuth()
    const [whOpen, setWhOpen] = useState<boolean>(false);
    const location = useLocation();
    const navigate = useNavigate();

    // TODO: Handle Warehouse Missing -> Select Warehouse
    if(!selectedWarehouse) return <div>No warehosue selected</div>;

    const otherWarehouses = user?.warehouses.filter(w => w.warehouseId !==selectedWarehouse.warehouseId)

    const isActive = (to:string) => location.pathname===to || location.pathname.startsWith(to+'/')

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-white px-4 shadow-sm">
        {/* Warehouse switcher */}
        <div className="flex items-center gap-3">
            <Warehouse className="h-5 w-5 text-blue-500"/>
            <Popover open={whOpen} onOpenChange={setWhOpen}>
                <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200/80"
                        aria-label="Switch warehouse"
                    >
                        {selectedWarehouse?.warehouseName??'Select WH'}
                        <ChevronDown className="h-4 w-4 text-gray-500"/>
                    </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-2">
                    <p className="mb-2 px-2 text-xs font-medium text-gray-500">Switch Warehouse</p>
                    {otherWarehouses?.map(wh => (
                        <button
                            key={wh.warehouseId}
                            onClick={()=> { setSelectedWarehouse(wh); setWhOpen(false) }}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-800 transition-colors hover:bg-gray-300/40"
                        >
                            <span className="text-lg">{getWarehouseEmoji(wh.warehouseName)}</span>
                            <div className="text-left">
                                <p className="font-medium">{wh.warehouseName}</p>
                                <p className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3 "/>{wh.warehouseLocation}
                                </p>
                            </div>
                        </button>
                    ))}
                </PopoverContent>
            </Popover>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(navLink => {
                const Icon = navLink.icon;
                return (
                <NavLink
                    key={navLink.to}
                    to={navLink.to}
                    className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive(navLink.to) 
                            ? 'bg-blue-500/10 text-blue-500' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'  
                    )}
                    aria-current= {isActive(navLink.to)? 'page' : undefined}
                >
                    <Icon className="h-4 w-4"/>
                    <span>{navLink.label}</span>
                </NavLink>
            )})}

        </div>

        {/* User Menu */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-gray-200" aria-label="User Menu">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                            {user?.trigram??'N/A'}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">{user?.trigram??'N/A'}</p>
                    <p className="text-xs text-gray-500">{user?.role??'N/A'}</p>
                </div>
                <DropdownMenuItem onClick={()=>logout()} className="text-red-500 hover:text-red-500">
                    <LogOut className="mr-2 h-4 w-4"/>
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    </header>
  )
}

export default Navbar