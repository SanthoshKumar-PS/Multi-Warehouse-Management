import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const Transfers = () => {
    const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between">
        <p>Transfers</p>
        <Button onClick={()=>navigate('/transfers/new')}>New Transfer</Button>
    </div>
  )
}

export default Transfers