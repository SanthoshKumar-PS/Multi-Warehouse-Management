import { useAuth } from "@/context/AuthProvider"
import { useNavigate } from "react-router-dom";

const Inventory = () => {
  const { selectedWarehouse, user, hasWarehouseAccess } = useAuth();
  const navigate = useNavigate()
  // TODO: Handle Missing Warehouse
  if(!selectedWarehouse) return 
  const canManage = hasWarehouseAccess(selectedWarehouse.warehouseId, 'MANAGE')
  console.log("Can Manage warehouse: ",canManage)
  return (
    <div>Inventory</div>
  )
}

export default Inventory