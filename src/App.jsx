import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider }        from "./context/CartContext";
import { AdminAuthProvider }   from "./context/AdminAuthContext";
import { AuthProvider }        from "./context/AuthContext";
import { UserAuthProvider }    from "./context/UserAuthContext";
import ProtectedRoute          from "./components/ProtectedRoute";
import UserProtectedRoute      from "./components/UserProtectedRoute";

import LandingPage       from "./pages/LandingPage";
import BookingPage       from "./pages/BookingPage";
import ShopPage          from "./pages/ShopPage";
import ProductPage       from "./pages/ProductPage";
import CheckoutPage      from "./pages/CheckoutPage";
import OrderPage         from "./pages/OrderPage";
import LoginPage         from "./pages/LoginPage";
import RegisterPage      from "./pages/RegisterPage";
import ProfilePage       from "./pages/ProfilePage";

import AdminLayout       from "./pages/admin/AdminLayout";
import AppointmentsAdmin from "./pages/admin/AppointmentsAdmin";
import OrdersAdmin       from "./pages/admin/OrdersAdmin";
import SlotsAdmin        from "./pages/admin/SlotsAdmin";
import ProductsAdmin     from "./pages/admin/ProductsAdmin";

import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      {/* UserAuthProvider wraps everything so any component can access user session */}
      <UserAuthProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <CartProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/"         element={<LandingPage />} />
                <Route path="/login"    element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/shop"     element={<ShopPage />} />
                <Route path="/shop/:id" element={<ProductPage />} />

                {/* Booking requires user login (UserProtectedRoute) */}
                <Route path="/booking" element={
                  <UserProtectedRoute><BookingPage /></UserProtectedRoute>
                } />

                {/* Checkout requires user login (UserProtectedRoute) */}
                <Route path="/checkout" element={
                  <UserProtectedRoute><CheckoutPage /></UserProtectedRoute>
                } />

                {/* Order and Profile still use the legacy ProtectedRoute */}
                <Route path="/order/:id" element={
                  <ProtectedRoute><OrderPage /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><ProfilePage /></ProtectedRoute>
                } />

                {/* Admin panel — protected by AdminAuthContext internally */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index               element={<AppointmentsAdmin />} />
                  <Route path="appointments" element={<AppointmentsAdmin />} />
                  <Route path="orders"       element={<OrdersAdmin />} />
                  <Route path="products"     element={<ProductsAdmin />} />
                  <Route path="slots"        element={<SlotsAdmin />} />
                </Route>
              </Routes>
            </CartProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </UserAuthProvider>
    </BrowserRouter>
  );
}
