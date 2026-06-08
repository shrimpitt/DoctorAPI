import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider }       from "./context/ThemeContext";
import { CartProvider }        from "./context/CartContext";
import { AdminAuthProvider }   from "./context/AdminAuthContext";
import { AuthProvider }        from "./context/AuthContext";
import { UserAuthProvider }    from "./context/UserAuthContext";
import ProtectedRoute          from "./components/ProtectedRoute";
import UserProtectedRoute      from "./components/UserProtectedRoute";

import LandingPage       from "./pages/LandingPage";
import CoursesPage       from "./pages/CoursesPage";
import CourseDetailPage  from "./pages/CourseDetailPage";
import BookingPage       from "./pages/BookingPage";
import ShopPage          from "./pages/ShopPage";
import ProductPage       from "./pages/ProductPage";
import CheckoutPage      from "./pages/CheckoutPage";
import OrderPage         from "./pages/OrderPage";
import AuthChoicePage    from "./pages/AuthChoicePage";
import LoginPage         from "./pages/LoginPage";
import RegisterPage      from "./pages/RegisterPage";
import ProfilePage       from "./pages/ProfilePage";
import HealthDiaryPage   from "./pages/HealthDiaryPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import DisclaimerModal   from "./components/DisclaimerModal";

import AdminLayout            from "./pages/admin/AdminLayout";
import AppointmentsAdmin      from "./pages/admin/AppointmentsAdmin";
import OrdersAdmin            from "./pages/admin/OrdersAdmin";
import SlotsAdmin             from "./pages/admin/SlotsAdmin";
import ProductsAdmin          from "./pages/admin/ProductsAdmin";
import AdminPatientsPage      from "./pages/admin/AdminPatientsPage";
import AdminPatientDiaryPage  from "./pages/admin/AdminPatientDiaryPage";

import "./index.css";

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      {/* UserAuthProvider wraps everything so any component can access user session */}
      <UserAuthProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <CartProvider>
              <DisclaimerModal />
              <Routes>
                {/* Public routes */}
                <Route path="/"              element={<LandingPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/courses"       element={<CoursesPage />} />
                <Route path="/courses/:id"   element={<CourseDetailPage />} />
                <Route path="/auth"          element={<AuthChoicePage />} />
                <Route path="/login"         element={<LoginPage />} />
                <Route path="/register"      element={<RegisterPage />} />
                <Route path="/shop"          element={<ShopPage />} />
                <Route path="/shop/:id"      element={<ProductPage />} />

                {/* Booking requires user login (UserProtectedRoute) */}
                <Route path="/booking" element={
                  <UserProtectedRoute><BookingPage /></UserProtectedRoute>
                } />

                {/* Checkout requires user login (UserProtectedRoute) */}
                <Route path="/checkout" element={
                  <UserProtectedRoute><CheckoutPage /></UserProtectedRoute>
                } />

                <Route path="/order/:id" element={
                  <UserProtectedRoute><OrderPage /></UserProtectedRoute>
                } />
                <Route path="/profile" element={
                  <UserProtectedRoute><ProfilePage /></UserProtectedRoute>
                } />
                <Route path="/health-diary" element={
                  <UserProtectedRoute><HealthDiaryPage /></UserProtectedRoute>
                } />

                {/* Admin panel — protected by AdminAuthContext internally */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index               element={<AppointmentsAdmin />} />
                  <Route path="appointments" element={<AppointmentsAdmin />} />
                  <Route path="orders"       element={<OrdersAdmin />} />
                  <Route path="products"     element={<ProductsAdmin />} />
                  <Route path="slots"                       element={<SlotsAdmin />} />
                  <Route path="patients"                    element={<AdminPatientsPage />} />
                  <Route path="patients/:userId/diary"      element={<AdminPatientDiaryPage />} />
                </Route>
              </Routes>
            </CartProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </UserAuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}
