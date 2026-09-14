import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("dist");
await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

const rows = JSON.parse(await fs.readFile(path.resolve("src/data.json"), "utf8"));
if (!Array.isArray(rows) || rows.length < 300) throw new Error("Lug‘at bazasi to‘liq emas.");
await fs.writeFile(path.join(OUT, "data.json"), JSON.stringify(rows, null, 2), "utf8");

for (const file of ["index.html", "styles.css", "app.js", "admin.html", "admin.css", "admin.js"]) {
  await fs.copyFile(path.resolve("src", file), path.join(OUT, file));
}
await fs.writeFile(path.join(OUT, "_redirects"), "/* /index.html 200\n", "utf8");
console.log(`TAYYOR: ${rows.length} birlik va admin panel nashrga tayyor.`);
