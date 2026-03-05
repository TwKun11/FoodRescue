const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function apiRegister(body) {
  const res = await fetch(`${getBaseUrl()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}