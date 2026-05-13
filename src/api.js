const BASE_URL = "http://localhost:8080";

// ── Admin auth headers (for admin panel endpoints) ──────
function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

// ── User auth headers (for regular user endpoints) ──────
export function userAuthHeaders() {
  const token = localStorage.getItem("user_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

// Bug fix: destructure headers from options BEFORE spreading rest,
// otherwise ...options would overwrite the merged headers object.
async function request(endpoint, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...authHeaders(), ...extraHeaders },
    ...rest,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// ── Doctor ──────────────────────────────────────────────
export const getDoctorProfile      = () => request("/api/doctor-profile");
export const getDoctorEducation    = () => request("/api/doctor-education");
export const getDoctorCertificates = () => request("/api/doctor-certificates");

// ── Consultation types ───────────────────────────────────
export const getConsultationTypes = () => request("/api/consultation-types");

// ── Schedule slots ───────────────────────────────────────
export const getScheduleSlots   = () => request("/api/doctor-schedule-slots/available");
export const createScheduleSlot = (data) =>
  request("/api/doctor-schedule-slots", { method: "POST", body: JSON.stringify(data) });

// ── Appointments ─────────────────────────────────────────
// User creates appointment — backend reads userId from Bearer token
export const createAppointment = (data) =>
  request("/api/appointments", {
    method:  "POST",
    headers: userAuthHeaders(),
    body:    JSON.stringify(data),
  });

// Admin: all appointments (admin_token)
export const getAppointments = () => request("/api/appointments");

// User: own appointments (user_token)
export const getMyAppointments = () =>
  request("/api/appointments/my", { headers: userAuthHeaders() });

export const getAppointmentById = (id) => request(`/api/appointments/${id}`);

export const updateAppointmentStatus = (id, status) =>
  request(`/api/appointments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

// ── Products ─────────────────────────────────────────────
export const getProducts          = () => request("/api/products");
export const getProductById       = (id) => request(`/api/products/${id}`);
export const getProductCategories = () => request("/api/product-categories");

// ── Orders (admin) ───────────────────────────────────────
export const getOrders    = () => request("/api/orders");
export const getOrderById = (id) => request(`/api/orders/${id}`);

export const updateOrderStatus = (id, status) =>
  request(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

// ── Orders (user) ────────────────────────────────────────
// POST /api/orders requires user token (Authorize Role=User)
export const createOrder = (data) =>
  request("/api/orders", {
    method:  "POST",
    headers: userAuthHeaders(),
    body:    JSON.stringify(data),
  });

// User's own order history
export const getMyOrders    = () =>
  request("/api/orders/my", { headers: userAuthHeaders() });

export const getMyOrderById = (id) =>
  request(`/api/orders/my/${id}`, { headers: userAuthHeaders() });

// ── Site contacts ────────────────────────────────────────
export const getSiteContacts = () => request("/api/site-contacts");

// ── User auth ────────────────────────────────────────────
// These functions use direct fetch() (not the request() helper) to guarantee
// Content-Type: application/json and Accept: application/json are set correctly.
// The backend expects PascalCase fields per RegisterUserDto / LoginUserDto.

// POST /api/Users/login
// Body (LoginUserDto):     { Email, Password }
// Response (UserAuthResponseDto): { token, userId, fullName, email, role }
export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/api/Users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept":       "application/json",
    },
    body: JSON.stringify({ Email: email, Password: password }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Login failed: ${res.status}`);
  }
  return res.json();
}

// POST /api/Users/register
// Body (RegisterUserDto):  { FullName, Email, Password }
// Response (UserAuthResponseDto): { token, userId, fullName, email, role }
export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/api/Users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept":       "application/json",
    },
    body: JSON.stringify({
      FullName: data.fullName,
      Email:    data.email,
      Password: data.password,
    }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Registration failed: ${res.status}`);
  }
  return res.json();
}

// GET /api/Users/me  (requires user_token Bearer header)
// Response: { id, fullName, email, role, createdAt }
export async function getCurrentUser() {
  const res = await fetch(`${BASE_URL}/api/Users/me`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      ...userAuthHeaders(),
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Get current user failed: ${res.status}`);
  }
  return res.json();
}

// ── Payments (mock + PayPal) ──────────────────────────────
// All payment endpoints require user_token.

// Step 1: Initialize payment session for an order.
// POST /api/orders/{id}/payment/init
// Body (InitOrderPaymentDto): { paymentMethod: "card" | "apple_pay" | "google_pay" }
export const initOrderPayment = (orderId, data) =>
  request(`/api/orders/${orderId}/payment/init`, {
    method:  "POST",
    headers: userAuthHeaders(),
    body:    JSON.stringify(data),
  });

// Step 2a: Simulate successful payment (mock, no real provider).
// POST /api/orders/{id}/payment/mock-success  — no body required.
export const mockPaymentSuccess = (orderId) =>
  request(`/api/orders/${orderId}/payment/mock-success`, {
    method:  "POST",
    headers: userAuthHeaders(),
  });

// Step 2b: Simulate failed payment (mock).
// POST /api/orders/{id}/payment/mock-fail  — no body required.
export const mockPaymentFail = (orderId) =>
  request(`/api/orders/${orderId}/payment/mock-fail`, {
    method:  "POST",
    headers: userAuthHeaders(),
  });

// PayPal flow — Step 1: Create a PayPal order, receive payPalOrderId.
// POST /api/orders/{id}/payment/paypal/create-order  — no body required.
// Response (CreatePayPalOrderResponseDto): { payPalOrderId, status }
export const createPayPalOrder = (orderId) =>
  request(`/api/orders/${orderId}/payment/paypal/create-order`, {
    method:  "POST",
    headers: userAuthHeaders(),
  });

// PayPal flow — Step 2: Capture payment after user approves in PayPal UI.
// POST /api/orders/{id}/payment/paypal/capture
// Body (CapturePayPalOrderRequestDto): { payPalOrderId }
export const capturePayPalOrder = (orderId, data) =>
  request(`/api/orders/${orderId}/payment/paypal/capture`, {
    method:  "POST",
    headers: userAuthHeaders(),
    body:    JSON.stringify(data),
  });
