import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const db = new DatabaseSync(path.join(root, "data", "belozerye.sqlite"), { readOnly: true });
const rows = db.prepare(`
  SELECT mentions.id, mentions.fragment_id, books.slug
  FROM mentions
  JOIN fragments ON fragments.id = mentions.fragment_id
  JOIN books ON books.id = fragments.book_id
`).all();
db.close();

const bookHtml = new Map();
for (const row of rows) {
  if (!bookHtml.has(row.slug)) {
    bookHtml.set(row.slug, await readFile(path.join(root, "dist", "books", row.slug, "index.html"), "utf8"));
  }
}
const missing = rows.filter((row) => !bookHtml.get(row.slug).includes(`id="${row.fragment_id}"`));
if (missing.length > 0) {
  throw new Error(`Упоминания без действующего якоря фрагмента (${missing.length}):\n${missing.map((row) => `${row.id}: ${row.fragment_id}`).join("\n")}`);
}
console.log(`Проверено якорей фрагментов: ${rows.length}. Все существуют в текстах книг.`);
