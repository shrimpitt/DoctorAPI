const BASE_URL = "http://localhost:8080";

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...authHeaders(), ...options.headers },
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// ── Doctor ──────────────────────────────────────────────
export const getDoctorProfile     = () => request("/api/doctor-profile");
export const getDoctorEducation   = () => request("/api/doctor-education");
export const getDoctorCertificates = () => request("/api/doctor-certificates");

// ── Consultation types ───────────────────────────────────
export const getConsultationTypes = () => request("/api/consultation-types");

// ── Schedule slots ───────────────────────────────────────
export const getScheduleSlots   = () => request("/api/doctor-schedule-slots/available");
export const createScheduleSlot = (data) =>
  request("/api/doctor-schedule-slots", { method: "POST", body: JSON.stringify(data) });

// ── Appointments ─────────────────────────────────────────
export const createAppointment = (data) =>
  request("/api/appointments", { method: "POST", body: JSON.stringify(data) });

export const getAppointments = () => request("/api/appointments");

export const getAppointmentById = (id) => request(`/api/appointments/${id}`);

export const updateAppointmentStatus = (id, status) =>
  request(`/api/appointments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

// ── Products ─────────────────────────────────────────────
export const getProducts       = () => request("/api/products");
export const getProductById    = (id) => request(`/api/products/${id}`);
export const getProductCategories = () => request("/api/product-categories");

// ── Orders ───────────────────────────────────────────────
export const createOrder = (data) =>
  request("/api/orders", { method: "POST", body: JSON.stringify(data) });

export const getOrders      = () => request("/api/orders");
export const getOrderById   = (id) => request(`/api/orders/${id}`);

export const updateOrderStatus = (id, status) =>
  request(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

// ── Site contacts ────────────────────────────────────────
export const getSiteContacts = () => request("/api/site-contacts");
