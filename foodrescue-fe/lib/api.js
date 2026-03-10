const BASE = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE()}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

// ============================================================
// AUTH
// ============================================================
export async function apiRegister(body) {
  return request("/api/auth/register", { method: "POST", body: JSON.stringify(body) });
}

export async function apiLogin(body) {
  return request("/api/auth/login", { method: "POST", body: JSON.stringify(body) });
}

export async function apiGoogleLogin(idToken) {
  return request("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export async function apiRefreshToken(refreshToken) {
  return request("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function apiVerifyEmail(token) {
  return request(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
}

export async function apiForgotPassword(email) {
  return request("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function apiResetPassword(token, newPassword) {
  return request("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function apiGetMe() {
  return request("/api/auth/me");
}

export async function apiUpdateMe(body) {
  return request("/api/auth/me", { method: "PUT", body: JSON.stringify(body) });
}

export async function apiChangePassword(body) {
  return request("/api/auth/change-password", { method: "POST", body: JSON.stringify(body) });
}

// ============================================================
// CATEGORIES
// ============================================================
export async function apiGetCategories() {
  return request("/api/categories");
}

// ============================================================
// PRODUCTS (public)
// ============================================================
export async function apiGetProducts({ categoryId, keyword, page = 0, size = 12 } = {}) {
  const params = new URLSearchParams({ page, size });
  if (categoryId) params.set("categoryId", categoryId);
  if (keyword) params.set("keyword", keyword);
  return request(`/api/products?${params}`);
}

export async function apiGetProduct(id) {
  return request(`/api/products/${id}`);
}

export async function apiGetVariantStock(variantId) {
  return request(`/api/products/variants/${variantId}/stock`);
}

// ============================================================
// ORDERS (customer)
// ============================================================
export async function apiPlaceOrder(body) {
  return request("/api/orders", { method: "POST", body: JSON.stringify(body) });
}

export async function apiGetMyOrders({ page = 0, size = 10 } = {}) {
  return request(`/api/orders?page=${page}&size=${size}`);
}

export async function apiGetOrderDetail(orderId) {
  return request(`/api/orders/${orderId}`);
}

// ============================================================
// SELLER – SHOP
// ============================================================
export async function apiGetMyShop() {
  return request("/api/seller/shop");
}

export async function apiUpdateMyShop(body) {
  return request("/api/seller/shop", { method: "PUT", body: JSON.stringify(body) });
}

// ============================================================
// SELLER – PRODUCTS
// ============================================================
export async function apiSellerGetProducts({ keyword, page = 0, size = 20 } = {}) {
  const params = new URLSearchParams({ page, size });
  if (keyword) params.set("keyword", keyword);
  return request(`/api/seller/products?${params}`);
}

export async function apiSellerCreateProduct(body) {
  return request("/api/seller/products", { method: "POST", body: JSON.stringify(body) });
}

export async function apiSellerUpdateProduct(productId, body) {
  return request(`/api/seller/products/${productId}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function apiSellerUploadImage(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE()}/api/seller/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

export async function apiSellerAddVariant(productId, body) {
  return request(`/api/seller/products/${productId}/variants`, { method: "POST", body: JSON.stringify(body) });
}

export async function apiSellerDeleteProduct(productId) {
  return request(`/api/seller/products/${productId}`, { method: "DELETE" });
}

// ============================================================
// SELLER – INVENTORY
// ============================================================
export async function apiSellerGetBatches() {
  return request("/api/seller/inventory/batches");
}

export async function apiSellerAddBatch(body) {
  return request("/api/seller/inventory/batches", { method: "POST", body: JSON.stringify(body) });
}

// ============================================================
// SELLER – ORDERS
// ============================================================
export async function apiSellerGetOrders({ page = 0, size = 20, status } = {}) {
  const params = new URLSearchParams({ page, size });
  if (status) params.append("status", status);
  return request(`/api/seller/orders?${params.toString()}`);
}

export async function apiSellerUpdateOrderStatus(sellerOrderId, status) {
  return request(`/api/seller/orders/${sellerOrderId}/status?status=${encodeURIComponent(status)}`, {
    method: "PUT",
  });
}

// ============================================================
// ADMIN
// ============================================================
export async function apiAdminGetUsers({ page = 0, size = 20 } = {}) {
  return request(`/api/admin/users?page=${page}&size=${size}`);
}

export async function apiAdminUpdateUserStatus(userId, status) {
  return request(`/api/admin/users/${userId}/status?status=${encodeURIComponent(status)}`, { method: "PUT" });
}

export async function apiAdminGetSellers({ page = 0, size = 20 } = {}) {
  return request(`/api/admin/sellers?page=${page}&size=${size}`);
}

export async function apiAdminCreateSeller(body) {
  return request("/api/admin/sellers", { method: "POST", body: JSON.stringify(body) });
}

export async function apiAdminUpdateSellerStatus(sellerId, status) {
  return request(`/api/admin/sellers/${sellerId}/status?status=${encodeURIComponent(status)}`, { method: "PUT" });
}

export async function apiAdminVerifySeller(sellerId) {
  return request(`/api/admin/sellers/${sellerId}/verify`, { method: "PUT" });
}

// ============================================================
// ADMIN – CATEGORIES
// ============================================================
export async function apiAdminGetCategories() {
  return request("/api/admin/categories");
}

export async function apiAdminCreateCategory(body) {
  return request("/api/admin/categories", { method: "POST", body: JSON.stringify(body) });
}

export async function apiAdminUpdateCategory(id, body) {
  return request(`/api/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function apiAdminDeleteCategory(id) {
  return request(`/api/admin/categories/${id}`, { method: "DELETE" });
}

// ============================================================
// CUSTOMER – ADDRESSES
// ============================================================
export async function apiGetAddresses() {
  return request("/api/addresses");
}

export async function apiCreateAddress(body) {
  return request("/api/addresses", { method: "POST", body: JSON.stringify(body) });
}

export async function apiUpdateAddress(addressId, body) {
  return request(`/api/addresses/${addressId}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function apiDeleteAddress(addressId) {
  return request(`/api/addresses/${addressId}`, { method: "DELETE" });
}

export async function apiSetDefaultAddress(addressId) {
  return request(`/api/addresses/${addressId}/default`, { method: "PUT" });
}

// ============================================================
// BRANDS (public + admin)
// ============================================================
export async function apiGetBrands() {
  return request("/api/brands");
}

export async function apiAdminGetBrands() {
  return request("/api/admin/brands");
}

export async function apiAdminCreateBrand(body) {
  return request("/api/admin/brands", { method: "POST", body: JSON.stringify(body) });
}

export async function apiAdminUpdateBrand(id, body) {
  return request(`/api/admin/brands/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function apiAdminDeleteBrand(id) {
  return request(`/api/admin/brands/${id}`, { method: "DELETE" });
}

export async function apiAdminRestoreBrand(id) {
  return request(`/api/admin/brands/${id}/restore`, { method: "PUT" });
}

// ============================================================
// SELLER – PRODUCT IMAGES
// ============================================================
export async function apiSellerGetProductImages(productId) {
  return request(`/api/seller/products/${productId}/images`);
}

export async function apiSellerAddProductImage(productId, file) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE()}/api/seller/products/${productId}/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

export async function apiSellerDeleteProductImage(productId, imageId) {
  return request(`/api/seller/products/${productId}/images/${imageId}`, { method: "DELETE" });
}

export async function apiSellerSetPrimaryImage(productId, imageId) {
  return request(`/api/seller/products/${productId}/images/${imageId}/primary`, { method: "PUT" });
}

// ============================================================
// SELLER – STATS
// ============================================================
export async function apiGetSellerStats() {
  return request("/api/seller/stats");
}
