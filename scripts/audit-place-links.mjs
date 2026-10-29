import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const placesPath = path.join(root, "dist", "places");
const booksPath = path.join(root, "dist", "books");
const placeSlugs = new Set((await readdir(placesPath, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name));
const missing = [];

for (const book of await readdir(booksPath, { withFileTypes: true })) {
  if (!book.isDirectory()) continue;
  const html = await readFile(path.join(booksPath, book.name, "index.html"), "utf8");
  for (const match of html.matchAll(/href="(?:\.\.\/)+places\/([^"/?#]+)\//gu)) {
    if (!placeSlugs.has(match[1])) missing.push(`${book.name}: ${match[1]}`);
  }
}

if (missing.length > 0) {
  throw new Error(`Ссылки ведут на несуществующие страницы:\n${missing.join("\n")}`);
}
console.log("Все внутренние ссылки на населённые пункты ведут на существующие страницы.");
