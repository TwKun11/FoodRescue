export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Trình duyệt không hỗ trợ định vị."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lon),
    "accept-language": "vi",
    addressdetails: "1",
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Không thể lấy địa chỉ từ vị trí hiện tại.");
  }

  return res.json();
}

function firstNonEmpty(...values) {
  return values.find((value) => typeof value === "string" && value.trim())?.trim() || "";
}

export function mapLocationToAddress(address = {}) {
  return {
    province: firstNonEmpty(address.city, address.province, address.state, address.region),
    district: firstNonEmpty(address.state_district, address.county, address.city_district, address.town),
    ward: firstNonEmpty(address.suburb, address.quarter, address.neighbourhood, address.village),
    addressLine: [
      address.house_number,
      address.building,
      address.road,
      address.residential,
      address.hamlet,
    ]
      .filter((value) => typeof value === "string" && value.trim())
      .join(", "),
  };
}

export function haversineDistanceMeters(from, to) {
  if (!from || !to) return null;
  const lat1 = Number(from.latitude);
  const lon1 = Number(from.longitude);
  const lat2 = Number(to.latitude);
  const lon2 = Number(to.longitude);

  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadius * c);
}

export function formatDistanceMeters(distanceMeters) {
  if (!Number.isFinite(distanceMeters)) return "";
  if (distanceMeters < 1000) return `${distanceMeters} m`;
  return `${(distanceMeters / 1000).toFixed(distanceMeters >= 10000 ? 0 : 1)} km`;
}

