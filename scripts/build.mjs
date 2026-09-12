import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const SOURCE =
  "https://ulug-saltanat-lugati.qodirjonovazohida9.chatgpt.site/";

const root = process.cwd();
const src = path.join(root, "Src");
const dist = path.join(root, "dist");

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });

const response = await fetch(SOURCE);

if (!response.ok) {
  throw new Error(`Saytni olishda xato: ${response.status}`);
}

const html = await response.text();
const $ = cheerio.load(html);

const rows = [];

$("table tbody tr").each((_, tr) => {
  const cells = $(tr)
    .find("td")
    .map((__, td) => $(td).text().trim())
    .get();

  if (cells.length >= 7) {
    rows.push({
      id: Number(cells[0]) || rows.length + 1,
      word: cells[1],
      type: cells[2],
      macro: cells[3],
      micro: cells[4],
      meaning: cells[5],
      page: cells[6],
    });
  }
});

if (rows.length < 300) {
  throw new Error(
    `Ma'lumotlar to'liq olinmadi. Faqat ${rows.length} birlik topildi.`
  );
}

const stats = {
  total: rows.length,
  istorizm: rows.filter(
    (x) => x.type.toLowerCase() === "istorizm"
  ).length,
  arxaizm: rows.filter(
    (x) => x.type.toLowerCase() === "arxaizm"
  ).length,
  macro: new Set(rows.map((x) => x.macro)).size,
};

await fs.writeFile(
  path.join(dist, "data.json"),
  JSON.stringify(rows, null, 2),
  "utf8"
);

await fs.writeFile(
  path.join(dist, "stats.json"),
  JSON.stringify(stats, null, 2),
  "utf8"
);

for (const file of ["index.html", "styles.css", "app.js"]) {
  await fs.copyFile(
    path.join(src, file),
    path.join(dist, file)
  );
}

console.log(
  `TAYYOR: ${rows.length} birlik mustaqil data.json fayliga yozildi`
);
