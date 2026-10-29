import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const db = new DatabaseSync(path.join(root, "data", "belozerye.sqlite"), { readOnly: true });
const invalidName = /\[|\]|\bпуста\b|\bполдеревни\b|,\s*что\s+(?:была|было|был|были)\b/iu;
const failures = [];

for (const row of db.prepare("SELECT id, name FROM places WHERE name IS NULL OR trim(name) = ''").all()) {
  failures.push(`У поселения ${row.id} не задано главное имя.`);
}
for (const row of db.prepare("SELECT id, name FROM places").all()) {
  if (invalidName.test(row.name)) failures.push(`Некорректное главное имя ${row.id}: ${row.name}`);
}
for (const row of db.prepare("SELECT id, place_id, name FROM place_names WHERE instr(name, ?) > 0").all(",")) {
  failures.push(`Некорректная запись имени ${row.id} (${row.place_id}): ${row.name}`);
}
for (const row of db.prepare(`
  SELECT states.id, states.place_id, names.name, states.assertion_kind, states.observed_year, states.display_period
  FROM place_name_states AS states JOIN place_names AS names ON names.id = states.place_name_id
`).all()) {
  if (invalidName.test(row.name)) failures.push(`Некорректная форма ${row.id}: ${row.name}`);
  if (row.assertion_kind !== "editorial" && !(row.display_period ?? row.observed_year)) {
    failures.push(`У формы ${row.id} не указан период.`);
  }
}

const bookHtml = new Map();
for (const row of db.prepare(`
  SELECT DISTINCT books.slug, fragments.id
  FROM mentions JOIN fragments ON fragments.id = mentions.fragment_id
  JOIN books ON books.id = fragments.book_id
  WHERE json_extract(fragments.raw_json, '$.content_class') IS NULL
    AND 1 = (SELECT COUNT(*) FROM fragments AS sibling WHERE sibling.book_id = fragments.book_id AND sibling.source_heading_id = fragments.source_heading_id)
`).all()) {
  if (!bookHtml.has(row.slug)) {
    bookHtml.set(row.slug, await readFile(path.join(root, "dist", "books", row.slug, "index.html"), "utf8"));
  }
  if (!bookHtml.get(row.slug).includes(`id="${row.id}"`)) {
    failures.push(`В книге ${row.slug} отсутствует якорь фрагмента ${row.id}.`);
  }
}
db.close();

if (failures.length) throw new Error(`Проверка модели имён не пройдена:\n${failures.join("\n")}`);
console.log("Модель имён и якоря цитат проверены.");
