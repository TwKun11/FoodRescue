import { getApiBaseUrl } from "@/lib/runtime-config";

const BASE = () => getApiBaseUrl();

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
export async function apiGetProducts({ categoryId, keyword, sort, minPrice, maxPrice, province, page = 0, size = 12 } = {}) {
  const params = new URLSearchParams({ page, size });
  if (categoryId) params.set("categoryId", categoryId);
  if (keyword) params.set("keyword", keyword);
  if (sort) params.set("sort", sort);
  if (minPrice != null && minPrice !== "") params.set("minPrice", minPrice);
  if (maxPrice != null && maxPrice !== "") params.set("maxPrice", maxPrice);
  if (province) params.set("province", province);
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

export async function apiSyncOrderPayment(orderId) {
  return request(`/api/orders/${orderId}/payment/sync`, { method: "POST" });
}

// ============================================================
// VOUCHERS (customer)
// ============================================================
export async function apiGetVoucherStore() {
  return request("/api/vouchers/store");
}

export async function apiGetMyVouchers() {
  return request("/api/vouchers/my");
}

export async function apiClaimVoucher(voucherId) {
  return request(`/api/vouchers/${voucherId}/claim`, { method: "POST" });
}

export async function apiPreviewVoucher({ code, orderValue, totalQuantity, province } = {}) {
  const params = new URLSearchParams();
  if (code) params.set("code", code);
  if (orderValue != null) params.set("orderValue", String(orderValue));
  if (totalQuantity != null) params.set("totalQuantity", String(totalQuantity));
  if (province) params.set("province", province);
  return request(`/api/vouchers/preview?${params.toString()}`);
}

// ============================================================
// SELLER APPLICATIONS
// ============================================================
export async function apiGetMySellerApplication() {
  return request("/api/seller-applications/me");
}

export async function apiSubmitSellerApplication(body) {
  return request("/api/seller-applications/me", { method: "POST", body: JSON.stringify(body) });
}

export async function apiUploadSellerApplicationImage(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE()}/api/seller-applications/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
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

export async function apiSellerUploadShopImage(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE()}/api/seller/shop/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
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
// SELLER – BANNER ADS
// ============================================================
export async function apiSellerCreateBannerAd(body) {
  return request("/api/seller/ads/create", { method: "POST", body: JSON.stringify(body) });
}

export async function apiSellerGetMyBannerAds() {
  return request("/api/seller/ads/my-ads");
}

// ============================================================
// ADMIN – BANNER ADS
// ============================================================
export async function apiAdminGetPendingBannerAds() {
  return request("/api/admin/ads/pending");
}

/** Admin: lấy danh sách banner theo trạng thái (pending | approved | rejected) */
export async function apiAdminGetBannerAdsByStatus(status = "pending") {
  return request(`/api/admin/ads?status=${encodeURIComponent(status)}`);
}

export async function apiAdminApproveBannerAd(id) {
  return request(`/api/admin/ads/${id}/approve`, { method: "PUT" });
}

export async function apiAdminRejectBannerAd(id, rejectReason) {
  return request(`/api/admin/ads/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ rejectReason: rejectReason || "" }),
  });
}

// ============================================================
// PUBLIC – BANNER ADS (active banners for /products page)
// ============================================================
export async function apiGetActiveBannerAds() {
  return request("/api/public/ads/active-banners");
}

// ============================================================
// ADMIN
// ============================================================
export async function apiAdminGetUsers({ page = 0, size = 20, search = "", role = "", status = "" } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search && search.trim()) params.set("search", search.trim());
  if (role) params.set("role", role);
  if (status) params.set("status", status);
  return request(`/api/admin/users?${params.toString()}`);
}

export async function apiAdminUpdateUserStatus(userId, status) {
  return request(`/api/admin/users/${userId}/status?status=${encodeURIComponent(status)}`, { method: "PUT" });
}

export async function apiAdminGetSellers({ page = 0, size = 20, search = "", status = "" } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search && search.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);
  return request(`/api/admin/sellers?${params.toString()}`);
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

export async function apiAdminGetSellerApplications({ page = 0, size = 20, search = "", status = "" } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search && search.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);
  return request(`/api/admin/seller-applications?${params.toString()}`);
}

export async function apiAdminApproveSellerApplication(id) {
  return request(`/api/admin/seller-applications/${id}/approve`, { method: "PUT" });
}

export async function apiAdminRejectSellerApplication(id, adminNote) {
  return request(`/api/admin/seller-applications/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ adminNote: adminNote || null }),
  });
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

/** Tổng hợp thống kê admin (doanh thu toàn nền tảng). Backend có thể chưa có endpoint. */
export async function apiAdminGetStats() {
  return request("/api/admin/stats");
}

/** Phân tích lãng phí thực phẩm cho admin */
export async function apiAdminGetWasteAnalytics({ full = true, limit = 5 } = {}) {
  const params = new URLSearchParams();
  if (full !== undefined) params.append("full", full);
  if (limit !== undefined) params.append("limit", limit);
  const query = params.toString();
  return request(`/api/admin/waste-analytics${query ? "?" + query : ""}`);
}

// ============================================================
// ADMIN - VOUCHERS
// ============================================================
export async function apiAdminGetVouchers({ page = 0, size = 20, search = "", status = "", discountType = "" } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search && search.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);
  if (discountType) params.set("discountType", discountType);
  return request(`/api/admin/vouchers?${params.toString()}`);
}

export async function apiAdminCreateVoucher(body) {
  return request("/api/admin/vouchers", { method: "POST", body: JSON.stringify(body) });
}

export async function apiAdminUpdateVoucher(id, body) {
  return request(`/api/admin/vouchers/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function apiAdminUpdateVoucherStatus(id, status) {
  return request(`/api/admin/vouchers/${id}/status?status=${encodeURIComponent(status)}`, { method: "PUT" });
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

// ============================================================
// CUSTOMER – REVIEWS (Product Reviews)
// ============================================================
export async function apiGetProductReviews(productId, { page = 0, size = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  return request(`/api/reviews/product/${productId}?${params.toString()}`);
}

export async function apiGetMyReviewForProduct(productId) {
  return request(`/api/reviews/product/${productId}/my-review`);
}

export async function apiCreateProductReview(body) {
  // body: { productId, rating, comment, imageUrls: [] }
  return request("/api/reviews", { method: "POST", body: JSON.stringify(body) });
}

export async function apiUpdateProductReview(reviewId, body) {
  // body: { rating, comment, imageUrls: [] }
  return request(`/api/reviews/${reviewId}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function apiDeleteProductReview(reviewId) {
  return request(`/api/reviews/${reviewId}`, { method: "DELETE" });
}

export async function apiCreateViolationReport(body) {
  return request("/api/reports", { method: "POST", body: JSON.stringify(body) });
}

export async function apiGetMyViolationReports({ page = 0, size = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  return request(`/api/reports/me?${params.toString()}`);
}

export async function apiCheckCanReviewProduct(productId) {
  // Check if user has purchased this product (completed status)
  return request(`/api/reviews/product/${productId}/can-review`);
}

// Upload review images (similar to product images)
export async function apiUploadReviewImage(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE()}/api/reviews/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

// Seller review stats
export async function apiGetSellerRatingStats() {
  // Get overall rating stats for all seller's products
  return request("/api/reviews/seller/stats");
}

export async function apiGetTopRatedSellerProducts(limit = 5) {
  // Get top rated products for seller's dashboard
  const params = new URLSearchParams({ limit: String(limit) });
  return request(`/api/reviews/seller/top-products?${params.toString()}`);
}

export async function apiMockTopRatedSellerProducts(limit = 5) {
  // MOCK: Return hardcoded data for testing
  const params = new URLSearchParams({ limit: String(limit) });
  return request(`/api/reviews/seller/mock/top-products?${params.toString()}`);
}

// Seller reviews management endpoints
export async function apiSellerGetProductsWithRatings({ page = 0, size = 15 } = {}) {
  // Get all seller's products with ratings and review statistics
  // Returns Map with: content, totalElements, totalPages, currentPage, pageSize
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  return request(`/api/reviews/seller/reviews/products?${params.toString()}`);
}

export async function apiSellerGetProductReviews(productId, { page = 0, size = 10 } = {}) {
  // Get all reviews for a specific seller's product
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  return request(`/api/reviews/seller/reviews/product/${productId}?${params.toString()}`);
}

export async function apiSellerGetReceivedReviews({ page = 0, size = 10 } = {}) {
  // Get all reviews received by the seller
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  return request(`/api/reviews/seller/reviews/received?${params.toString()}`);
}

export async function apiAdminGetReviews({
  page = 0,
  size = 20,
  search = "",
  minRating = "",
  maxRating = "",
  spamOnly,
  flaggedOnly,
} = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search && search.trim()) params.set("search", search.trim());
  if (minRating !== "" && minRating != null) params.set("minRating", String(minRating));
  if (maxRating !== "" && maxRating != null) params.set("maxRating", String(maxRating));
  if (spamOnly !== undefined && spamOnly !== null) params.set("spamOnly", String(spamOnly));
  if (flaggedOnly !== undefined && flaggedOnly !== null) params.set("flaggedOnly", String(flaggedOnly));
  return request(`/api/admin/reviews?${params.toString()}`);
}

export async function apiAdminMarkReviewSpam(reviewId, note = "") {
  return request(`/api/admin/reviews/${reviewId}/mark-spam`, {
    method: "PUT",
    body: JSON.stringify({ note }),
  });
}

export async function apiAdminFlagNegativeReview(reviewId, note = "") {
  return request(`/api/admin/reviews/${reviewId}/flag-negative`, {
    method: "PUT",
    body: JSON.stringify({ note }),
  });
}

export async function apiAdminDeleteReview(reviewId) {
  return request(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
}

export async function apiAdminGetViolationReports({ page = 0, size = 20, search = "", type = "", status = "" } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search && search.trim()) params.set("search", search.trim());
  if (type) params.set("type", type);
  if (status) params.set("status", status);
  return request(`/api/admin/reports?${params.toString()}`);
}

export async function apiAdminUpdateViolationReportStatus(id, body) {
  return request(`/api/admin/reports/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function apiAdminGetModerationStats(topSellerLimit = 5) {
  return request(`/api/admin/reports/stats?topSellerLimit=${encodeURIComponent(topSellerLimit)}`);
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
