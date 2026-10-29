import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const db = new DatabaseSync(path.join(root, "data", "belozerye.sqlite"), { readOnly: true });
const books = db.prepare("SELECT id, slug FROM books").all();
const sourceDocuments = new Map(db.prepare("SELECT book_id, html FROM book_documents").all()
  .map((row) => [row.book_id, row.html]));
const fragments = db.prepare(`
  SELECT id, book_id, source_heading_id, link_target_id, raw_json
  FROM fragments
  ORDER BY book_id, position
`).all().map((row) => ({ ...row, ...JSON.parse(row.raw_json) }));
db.close();

const idsIn = (html) => [...String(html).matchAll(/\bid="([^"]+)"/gu)].map((match) => match[1]);
const failures = [];
const finalIdsByBook = new Map();

for (const book of books) {
  const finalHtml = await readFile(path.join(root, "dist", "books", book.slug, "index.html"), "utf8");
  const finalIds = idsIn(finalHtml);
  const uniqueIds = new Set(finalIds);
  finalIdsByBook.set(book.id, uniqueIds);
  const duplicates = [...uniqueIds].filter((id) => finalIds.filter((value) => value === id).length > 1);
  if (duplicates.length) failures.push(`${book.slug}: повторяющиеся id: ${duplicates.join(", ")}`);
}

for (const fragment of fragments) {
  const sourceHtml = sourceDocuments.get(fragment.book_id);
  const finalIds = finalIdsByBook.get(fragment.book_id);
  if (!sourceHtml?.includes(`id="${fragment.source_heading_id}"`)) {
    failures.push(`${fragment.id}: не найден source_heading_id "${fragment.source_heading_id}" в исходном тексте книги.`);
  }
  const fragmentAnchor = fragment.following_only ? fragment.source_heading_id : fragment.id;
  if (!finalIds?.has(fragmentAnchor)) {
    failures.push(`${fragment.id}: не найден якорь фрагмента "${fragmentAnchor}" в собранной книге.`);
  }
  if (fragment.link_target_id && !finalIds?.has(fragment.link_target_id)) {
    failures.push(`${fragment.id}: не найден link_target_id "${fragment.link_target_id}" в собранной книге.`);
  }
}

if (failures.length) throw new Error(`Проверка навигации по книгам не пройдена:\n${failures.join("\n")}`);
console.log(`Навигация по книгам проверена: ${books.length} книг, ${fragments.length} фрагментов; дублирующихся якорей нет.`);
