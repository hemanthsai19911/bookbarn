import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { logout, refreshAccessToken, getCurrentUser } from "./services/auth";

// Pages
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import UnifiedLogin from "./pages/UnifiedLogin";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

import AdminPage from "./pages/AdminPage";
import AdminBooks from "./pages/AdminBooks";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard";

import UpdateProfile from "./pages/UpdateProfile";
import ProfileView from "./pages/ProfileView";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderSummary from "./pages/OrderSummary";

// Delivery Agent Pages
import DeliveryRegister from "./pages/DeliveryRegister";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import DeliveryLogin from "./pages/DeliveryLogin";
import DeliveryOrderDetails from "./pages/DeliveryOrderDetails";
import DeliveryHistory from "./pages/DeliveryHistory";
import DeliveryProfile from "./pages/DeliveryProfile";
import DeliveryProfileEdit from "./pages/DeliveryProfileEdit";
import VendorRegister from "./pages/VendorRegister";
import VendorLogin from "./pages/VendorLogin";
import VendorDashboard from "./pages/VendorDashboard";
import VendorProfile from "./pages/VendorProfile";
import VendorProfileEdit from "./pages/VendorProfileEdit";
import VendorOrderDetails from "./pages/VendorOrderDetails";
import AdminVendors from "./pages/AdminVendors";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Components
import Navbar from "./components/Navbar";

/* ----------------------------------------------------
   ROUTE GUARDS
---------------------------------------------------- */

// USER PROTECTED
function PrivateRoute({ children }) {
  const user = getCurrentUser();
  const token = localStorage.getItem("accessToken");

  // Delivery agent should NOT go through private user route
  const delivery = localStorage.getItem("deliveryAgent");

  if (delivery) return <Navigate to="/delivery/dashboard" replace />;

  if (!user || !token) return <Navigate to="/login" replace />;

  return children;
}

// ADMIN PROTECTED
function AdminRoute({ children }) {
  const user = getCurrentUser();
  const token = localStorage.getItem("accessToken");

  if (!token || !user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return children;
}

// DELIVERY AGENT PROTECTED
function DeliveryRoute({ children }) {
  let agent = localStorage.getItem("deliveryAgent");
  let token = localStorage.getItem("deliveryToken");

  try {
    agent = agent ? JSON.parse(agent) : null;
  } catch {
    agent = null;
  }

  if (!agent || !agent.id || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// VENDOR PROTECTED
function VendorRoute({ children }) {
  const token = localStorage.getItem("vendorToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/* ----------------------------------------------------
   AUTO LOGOUT (ONLY FOR USER TOKEN)
---------------------------------------------------- */
function AutoLogoutWatcher() {
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      // delivery agent should be ignored here
      const deliveryToken = localStorage.getItem("deliveryToken");
      if (deliveryToken) return;

      if (!token || !refreshToken) return;

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch {
        logout();
        window.location.href = "/login";
        return;
      }

      if (decoded.exp * 1000 < Date.now()) {
        refreshAccessToken();
      }

    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

/* ----------------------------------------------------
   MAIN APP ROUTING
---------------------------------------------------- */
export default function App() {
  return (
    <div>
      <Navbar />
      <AutoLogoutWatcher />

      <main className="container mt-4">
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Books />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/login" element={<UnifiedLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* USER PROTECTED */}
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/orders/:orderId" element={<PrivateRoute><OrderDetails /></PrivateRoute>} />

          <Route path="/profile" element={<PrivateRoute><ProfileView /></PrivateRoute>} />
          <Route path="/update-profile" element={<PrivateRoute><UpdateProfile /></PrivateRoute>} />

          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
          <Route path="/order-summary" element={<PrivateRoute><OrderSummary /></PrivateRoute>} />
          <Route path="/payment-success" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/books" element={<AdminRoute><AdminBooks /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

          {/* DELIVERY AUTH */}
          <Route path="/delivery/register" element={<DeliveryRegister />} />

          {/* DELIVERY PROTECTED */}
          <Route path="/delivery/dashboard" element={<DeliveryRoute><DeliveryDashboard /></DeliveryRoute>} />

          <Route path="/delivery/profile" element={<DeliveryRoute><DeliveryProfile /></DeliveryRoute>} />
          <Route path="/delivery/update-profile" element={<DeliveryRoute><DeliveryProfileEdit /></DeliveryRoute>} />

          <Route path="/delivery/order/:orderId" element={<DeliveryRoute><DeliveryOrderDetails /></DeliveryRoute>} />
          <Route path="/delivery/history" element={<DeliveryRoute><DeliveryHistory /></DeliveryRoute>} />


          {/* VENDOR ROUTES */}
          <Route path="/vendors/register" element={<VendorRegister />} />
          <Route path="/vendor/dashboard" element={<VendorRoute><VendorDashboard /></VendorRoute>} />
          <Route path="/vendor/orders/:orderId" element={<VendorRoute><VendorOrderDetails /></VendorRoute>} />
          <Route path="/vendor/profile" element={<VendorRoute><VendorProfile /></VendorRoute>} />
          <Route path="/vendor/update-profile" element={<VendorRoute><VendorProfileEdit /></VendorRoute>} />
          <Route path="/admin/vendors" element={<AdminRoute><AdminVendors /></AdminRoute>} />

        </Routes>
      </main>
    </div>
  );
}

