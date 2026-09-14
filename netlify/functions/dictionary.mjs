import { getStore } from "@netlify/blobs";

const json = (status, value) =>
  new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });

export default async function handler(request) {
  const store = getStore("ulug-saltanat-lugati");

  if (request.method === "GET") {
    const entries = await store.get("dictionary-entries", {
      type: "json"
    });

    return json(200, entries ?? []);
  }

  const supplied =
    request.headers.get("x-admin-password") ?? "";

  const expected =
    Netlify.env.get("ADMIN_PASSWORD") ?? "";

  if (!expected || supplied !== expected) {
    return json(401, {
      error: "Parol noto‘g‘ri."
    });
  }

  if (request.method !== "PUT") {
    return json(405, {
      error: "Bu amal qo‘llab-quvvatlanmaydi."
    });
  }

  let entries;

  try {
    entries = await request.json();
  } catch {
    return json(400, {
      error: "Ma’lumot formati noto‘g‘ri."
    });
  }

  if (!Array.isArray(entries) || entries.length > 5000) {
    return json(400, {
      error: "Lug‘at ma’lumotlari noto‘g‘ri."
    });
  }

  for (const item of entries) {
    const validId =
      Number.isInteger(Number(item.id));

    const validHeadword =
      String(item.headword ?? "").trim();

    const validMeaning =
      String(item.modernMeaning ?? "").trim();

    if (!validId || !validHeadword || !validMeaning) {
      return json(400, {
        error:
          "Har bir birlikda raqam, bosh so‘z va hozirgi ma’no bo‘lishi shart."
      });
    }
  }

  await store.setJSON("dictionary-entries", entries);

  return json(200, {
    ok: true,
    count: entries.length
  });
}
