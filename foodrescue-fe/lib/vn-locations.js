/**
 * Vietnam administrative divisions – provinces.open-api.vn
 * GET https://provinces.open-api.vn/api/ (provinces, depth=1)
 * GET https://provinces.open-api.vn/api/p/{code}?depth=2 (districts)
 * GET https://provinces.open-api.vn/api/d/{code}?depth=2 (wards)
 */

const BASE = "https://provinces.open-api.vn/api";

export async function fetchProvinces() {
  const res = await fetch(`${BASE}/?depth=1`);
  if (!res.ok) throw new Error("Không tải được danh sách tỉnh/thành");
  return res.json();
}

export async function fetchDistricts(provinceCode) {
  const res = await fetch(`${BASE}/p/${provinceCode}?depth=2`);
  if (!res.ok) throw new Error("Không tải được danh sách quận/huyện");
  const data = await res.json();
  return data.districts || [];
}

export async function fetchWards(districtCode) {
  const res = await fetch(`${BASE}/d/${districtCode}?depth=2`);
  if (!res.ok) throw new Error("Không tải được danh sách phường/xã");
  const data = await res.json();
  return data.wards || [];
}
