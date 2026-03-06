import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthProvider";
import { useNavigate } from "react-router-dom"

const Transfers = () => {
    const { selectedWarehouse, hasWarehouseAccess } = useAuth();
    // TODO: Handle Missing Warehouse
    if(!selectedWarehouse) return 
    const canManage = hasWarehouseAccess(selectedWarehouse.warehouseId, 'MANAGE');
    console.log("Can Manage warehouse: ",canManage)
    const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between">
        <p>Transfers</p>
        {canManage && (
          <Button onClick={()=>navigate('/transfers/new')}>New Transfer</Button>
        )}
    </div>
  )
}

export default Transfers