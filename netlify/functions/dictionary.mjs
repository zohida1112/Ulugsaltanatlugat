import { getStore } from "@netlify/blobs";

const json = (statusCode, value) => ({ statusCode, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }, body: JSON.stringify(value) });

export const handler = async (event) => {
  const store = getStore({ name: "ulug-saltanat-lugati", consistency: "strong" });
  if (event.httpMethod === "GET") {
    const entries = await store.get("dictionary-entries", { type: "json" });
    return json(200, entries ?? []);
  }
  const supplied = event.headers["x-admin-password"] ?? "";
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || supplied !== expected) return json(401, { error: "Parol noto‘g‘ri." });
  if (event.httpMethod !== "PUT") return json(405, { error: "Bu amal qo‘llab-quvvatlanmaydi." });
  let entries;
  try { entries = JSON.parse(event.body || "[]"); }
  catch { return json(400, { error: "Ma’lumot formati noto‘g‘ri." }); }
  if (!Array.isArray(entries) || entries.length > 5000) return json(400, { error: "Lug‘at ma’lumotlari noto‘g‘ri." });
  for (const item of entries) {
    if (!Number.isInteger(Number(item.id)) || !String(item.headword ?? "").trim() || !String(item.modernMeaning ?? "").trim()) return json(400, { error: "Har bir birlikda raqam, bosh so‘z va hozirgi ma’no bo‘lishi shart." });
  }
  await store.setJSON("dictionary-entries", entries);
  return json(200, { ok: true, count: entries.length });
};
