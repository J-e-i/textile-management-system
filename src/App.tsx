import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import BuyerLayout from "./components/layout/BuyerLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Public Pages
import Home from "./pages/Home";
import Fabrics from "./pages/Fabrics";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Buyer Pages
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import NewOrder from "./pages/buyer/NewOrder";
import BuyerOrders from "./pages/buyer/BuyerOrders";
import BuyerQuotations from "./pages/buyer/BuyerQuotations";
import BuyerInvoices from "./pages/buyer/BuyerInvoices";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBuyers from "./pages/admin/AdminBuyers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminQuotations from "./pages/admin/AdminQuotations";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/fabrics" element={<Fabrics />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Auth Routes (no layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Buyer Dashboard Routes */}
            <Route path="/buyer" element={
              <ProtectedRoute allowedRole="buyer">
                <BuyerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<BuyerDashboard />} />
              <Route path="new-order" element={<NewOrder />} />
              <Route path="orders" element={<BuyerOrders />} />
              <Route path="quotations" element={<BuyerQuotations />} />
              <Route path="invoices" element={<BuyerInvoices />} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="buyers" element={<AdminBuyers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="quotations" element={<AdminQuotations />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
