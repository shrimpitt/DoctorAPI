// Empty BASE_URL — all /api requests go through the Vite proxy (vite.config.js).
// Proxy target: http://localhost:5018 (local dev). For Docker: change target to http://localhost:8080.
const BASE_URL = "";

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

// POST /api/doctor-schedule-slots/bulk  [Admin]
// Creates multiple slots in one request. Uses the shared request() helper so
// the admin Bearer token from authHeaders() is included automatically.
export const createBulkSlots = (data) =>
  request("/api/doctor-schedule-slots/bulk", { method: "POST", body: JSON.stringify(data) });

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
export async function createOrder(data) {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept":       "application/json",
      ...userAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error("Order error:", errText);
    throw new Error(errText);
  }
  return res.json();
}

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
// ── New payment endpoints (POST /api/payments/*) ──────────
// These are thin wrappers over the same mock logic, but exposed
// via /api/payments/* for cleaner separation.
// TODO (production): Replace body handling with Stripe/Kaspi/CloudPayments SDK calls.

// POST /api/payments/initiate
// Body: { orderId, paymentMethod, cardNetwork?, cardLastFour? }
export const initiatePayment = (data) =>
  request("/api/payments/initiate", {
    method:  "POST",
    headers: userAuthHeaders(),
    body:    JSON.stringify(data),
  });

// POST /api/payments/confirm
// Body: { orderId, paymentSessionId, mockSuccess, cardLastFour?, cardNetwork? }
export const confirmPayment = (data) =>
  request("/api/payments/confirm", {
    method:  "POST",
    headers: userAuthHeaders(),
    body:    JSON.stringify(data),
  });

// GET /api/payments/{orderId}/status
export const getPaymentStatus = (orderId) =>
  request(`/api/payments/${orderId}/status`, {
    headers: userAuthHeaders(),
  });

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

// ── Health Diary — Peptide Recommendations ────────────────
// Fields returned: { productId, productName, reasoning }
// Arrays may come as plain [] or wrapped in { $values: [] }.

// POST /api/health-diary/recommend-products  [User]
// Analyses current user's diary entries and saves/returns recommendations.
export const generateMyRecommendations = () =>
  request("/api/health-diary/recommend-products", {
    method:  "POST",
    headers: userAuthHeaders(),
  });

// GET /api/health-diary/my/recommendations  [User]
export const getMyRecommendations = () =>
  request("/api/health-diary/my/recommendations", { headers: userAuthHeaders() });

// GET /api/health-diary/admin/user/{userId}/recommendations  [Admin]
export const getAdminUserRecommendations = (userId) =>
  adminFetch(`/api/health-diary/admin/user/${userId}/recommendations`);

// ── Health Diary (admin) ─────────────────────────────────
// All endpoints require admin_token Bearer.

async function adminFetch(path, options = {}) {
  const token = localStorage.getItem("admin_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Accept":       "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Admin API error [${res.status}] ${path}:`, err);
    throw new Error(err);
  }
  if (res.status === 204) return null;
  return res.json();
}

// GET /api/Users — list all registered users (admin token required).
// Handles both plain array and {$values:[...]} wrapper from .NET.
export async function getAllUsers() {
  const data = await adminFetch("/api/Users");
  return Array.isArray(data) ? data : (data?.$values ?? []);
}

// GET /api/health-diary/admin/user/{userId}
export const getAdminUserDiary = (userId) =>
  adminFetch(`/api/health-diary/admin/user/${userId}`);

// GET /api/health-diary/admin/user/{userId}/summary
export const getAdminUserDiarySummary = (userId) =>
  adminFetch(`/api/health-diary/admin/user/${userId}/summary`);

// POST /api/health-diary/admin/user/{userId}/ai-summary
export const generateAiSummary = (userId) =>
  adminFetch(`/api/health-diary/admin/user/${userId}/ai-summary`, { method: "POST" });

// GET /api/health-diary/admin/user/{userId}/ai-summaries
export const getAiSummaries = (userId) =>
  adminFetch(`/api/health-diary/admin/user/${userId}/ai-summaries`);

// ── Health Diary (patient) ────────────────────────────────
// All endpoints require user_token Bearer. camelCase per API contract.

async function diaryFetch(path, options = {}) {
  const token = localStorage.getItem("user_token");
  if (!token) {
    console.warn("diaryFetch: user_token is missing — request will be rejected by the server");
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Accept":       "application/json",
      ...userAuthHeaders(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401 || res.status === 403) {
      console.error(`diaryFetch [${res.status}] ${path}: token=${token ? "present" : "MISSING"}`, err);
    } else {
      console.error(`Health Diary error [${res.status}] ${path}:`, err);
    }
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// POST /api/health-diary
export const createDiaryEntry  = (payload) =>
  diaryFetch("/api/health-diary", { method: "POST", body: JSON.stringify(payload) });

// GET /api/health-diary/my
export const getMyDiaryEntries = () =>
  diaryFetch("/api/health-diary/my");

// GET /api/health-diary/my/{id}
export const getMyDiaryEntry   = (id) =>
  diaryFetch(`/api/health-diary/my/${id}`);

// PUT /api/health-diary/my/{id}
export const updateDiaryEntry  = (id, payload) =>
  diaryFetch(`/api/health-diary/my/${id}`, { method: "PUT", body: JSON.stringify(payload) });

// DELETE /api/health-diary/my/{id}
export const deleteDiaryEntry  = (id) =>
  diaryFetch(`/api/health-diary/my/${id}`, { method: "DELETE" });

// GET /api/health-diary/my/summary
export const getMyDiarySummary = () =>
  diaryFetch("/api/health-diary/my/summary");
