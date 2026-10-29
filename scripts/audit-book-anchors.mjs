import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const placesRoot = "dist/places";
const bookCache = new Map();
const missing = [];
let checked = 0;

for (const entry of await readdir(placesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const page = await readFile(join(placesRoot, entry.name, "index.html"), "utf8");
  const links = page.matchAll(/href="\.\.\/\.\.\/books\/([^/]+)\/#([^"]+)"/gu);
  for (const link of links) {
    checked += 1;
    const bookSlug = decodeURIComponent(link[1]);
    const anchor = decodeURIComponent(link[2]);
    if (!bookCache.has(bookSlug)) {
      bookCache.set(bookSlug, await readFile(join("dist/books", bookSlug, "index.html"), "utf8"));
    }
    if (!bookCache.get(bookSlug).includes(`id="${anchor}"`)) {
      missing.push(`${entry.name}: books/${bookSlug}/#${anchor}`);
    }
  }
  const sourceFrames = page.matchAll(/<iframe\b[^>]*\bsrc="\.\.\/\.\.\/books\/([^/]+)\/\?[^"#]*#([^"]+)"/gu);
  for (const frame of sourceFrames) {
    checked += 1;
    const bookSlug = decodeURIComponent(frame[1]);
    const anchor = decodeURIComponent(frame[2]);
    if (!bookCache.has(bookSlug)) {
      bookCache.set(bookSlug, await readFile(join("dist/books", bookSlug, "index.html"), "utf8"));
    }
    if (!bookCache.get(bookSlug).includes(`id="${anchor}"`)) {
      missing.push(`${entry.name}: embedded books/${bookSlug}/#${anchor}`);
    }
  }
}

if (missing.length > 0) {
  console.error(`Не найдены якоря (${missing.length}):\n${missing.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Проверено ссылок на цитаты: ${checked}. Все якоря существуют.`);
}
