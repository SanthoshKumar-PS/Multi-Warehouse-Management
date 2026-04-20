import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import ProductDetail from "./pages/ProductDetail";
import Transactions from "./pages/Transactions";
import LowStock from "./pages/LowStock";
import NotFound from "./pages/NotFound";
import AuthProvider from "./context/AuthProvider";
import Transfers from "./pages/Transfers";
import NewTransfer from "./pages/NewTransfer";
import TransferDetails from "./pages/TransferDetails";
import PurchaseOrders from "./pages/PurchaseOrders";
import NewPurchaseOrder from "./pages/NewPurchaseOrder";
import PurchaseOrderDetail from "./pages/PurchaseOrderDetail";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/:productMn" element={<ProductDetail />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/transfers/:transferNo" element={<TransferDetails />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/purchase-orders/:poNumber" element={<PurchaseOrderDetail />} />
            <Route path="/purchase-orders/new" element={<NewPurchaseOrder />} />
            <Route path="/transfers/new" element={<NewTransfer />} />
            <Route path="/low-stock" element={<LowStock />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
