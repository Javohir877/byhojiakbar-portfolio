// Backend manzili. Bo'sh bo'lsa sayt backendsiz ishlaydi:
// statistika ko'rinmaydi, buyurtma formasi o'rniga Telegram tugmasi chiqadi.
export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export async function getViews() {
  if (!API_URL) return {};
  try {
    const r = await fetch(`${API_URL}/api/views`);
    return r.ok ? await r.json() : {};
  } catch {
    return {};
  }
}

export async function addView(id) {
  if (!API_URL) return null;
  try {
    const r = await fetch(`${API_URL}/api/views/${encodeURIComponent(id)}`, { method: "POST" });
    return r.ok ? (await r.json()).views : null;
  } catch {
    return null;
  }
}

export async function sendOrder(order) {
  const r = await fetch(`${API_URL}/api/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Xabar yuborilmadi");
  return data;
}
