import { readFile } from "node:fs/promises";

const bookId = "kirillov-1559";
const escape = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const people = [
  "Белобров", "Митя", "Иванча", "Нечайко", "Иванко", "Нечай", "Гриша", "Дороня", "Кирьянко",
  "Третьяк", "Дубас", "Федя Доронин", "Федя", "Малах", "Демка", "Сидор", "Корнило", "Ромаша",
  "Денис", "Якуня", "Треня", "Оншука", "Новик", "Ермол", "Иван Зуев", "Мичюра", "Соня",
  "Малюта", "Останя Ортемов", "Останя", "Кирило", "Созон", "Мороз", "Панфил", "Ерема Тихонов",
  "Ерема", "Фрол", "Иода", "Биршун", "Истома", "Лазутка", "Клим", "Плохой", "Офоня", "Максим",
  "Парута", "Кондрата", "Лютой", "Белоозера", "Стырь", "Микулка", "Подосенко", "Кирилко", "Лазук",
  "Троша Чякишев", "Троша", "Иван Тихонов", "Иван Исаков", "Иван Чякишев", "Иван Климов", "Иван",
  "Исак", "Ермак", "Пятунька", "Матюшка", "Торопко", "Кляпик", "Чюдин", "Зык", "Илейка",
  "Стефан", "Карп", "Василей Рослово", "Василей Рослого", "Василей", "Семен Климов", "Семен",
  "Еля Аристов", "Еля", "Давыд", "Гриша Аристов", "Нечяй Климов", "Нечяй", "Пятко Макаров",
  "Ермолко", "Иванчя", "Третияк", "Дема", "Кондрат", "Курило", "Роман", "Гридя", "Оншук",
  "Ярыга", "Илья", "Первуня", "Микула", "Подосен", "Белозер", "Олфер", "Суровец", "Степан", "Ваня"
].sort((a, b) => b.length - a.length);
const namePattern = new RegExp(`(?<![\\p{L}\\p{N}])(?:${people.join("|")})(?![\\p{L}\\p{N}])`, "gu");
const page = (folio) => `<span class="page-mark">(л. ${escape(folio.replace(/\s+об\./u, "об."))})</span>`;
const inline = (text) => text.split(/(\[[^\]]+\]|\/\/\s*\{[^}]+\})/u).map((part) => {
  if (part.startsWith("[")) return `<span class="source-note">${escape(part)}</span>`;
  if (part.startsWith("//")) return page(part.match(/\{([^}]+)\}/u)[1]);
  return escape(part.replaceAll("<…>", "(…)"))
    .replace(namePattern, '<strong class="person-name">$&</strong>');
}).join("");
const headingText = (text) => escape(text).replace(/\[[^\]]+\]/gu, '<span class="name-variant">$&</span>');
const toggle = (target) => `<button class="heading-toggle" type="button" data-body-toggle aria-controls="${target}" aria-expanded="true" aria-label="Свернуть раздел"><span class="heading-toggle-icon" aria-hidden="true">▾</span></button>`;
const toc = (level, id, title) => `<div class="contents-entry contents-level-${level}" data-contents-entry data-contents-level="${level}"><a class="contents-link" href="#${id}">${escape(title)}</a></div>`;

export const up = async (db) => {
  const data = JSON.parse(await readFile(new URL("../content/books/kirillov_monastery-1559/koshchievsky-additions.json", import.meta.url), "utf8"));
  let html = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId)?.html;
  if (!html || html.includes('id="seed-koshchievsky-title"')) throw new Error("Missing book or existing Koshchievsky sections.");
  const fragmentRows = [];
  const sections = [
    { key: "seed", title: "Семянник ржаной и яровой. Ключ Кощеевьской", folio: "111", count: 32, boundary: '<h1 id="seed"', tocBoundary: '<div class="contents-entry contents-level-1"' },
    { key: "rent", title: "Оброчник всякого хлеба Кощиевского ключа. Ключ Кощиевской", folio: "235 об.", count: 28, boundary: '<h1 id="rent-charoma-title"', tocBoundary: toc(1, "rent-charoma-title", "Оброчник Чяромского ключя всякого хлеба. Ключ Чяромской [Чаромской]") }
  ];
  for (const spec of sections) {
    const sectionId = `${spec.key}-koshchievsky-title`;
    const bodyId = `body-${spec.key}-koshchievsky`;
    let content = `<h1 id="${sectionId}" class="primary-section-heading">${toggle(bodyId)}${page(spec.folio)} ${escape(spec.title)}.</h1><div class="group-content" id="${bodyId}">\n`;
    let contents = toc(1, sectionId, spec.title) + "\n";
    let recordCount = 0;
    let subsection = false;
    for (const entry of data[spec.key]) {
      if (entry.type === "heading") {
        const id = `${spec.key}-koshchievsky-kolenets`;
        content += `<h2 id="${id}" class="group-heading">${toggle(`body-${id}`)}${headingText(entry.title)}.</h2><div class="group-content" id="body-${id}">\n`;
        contents += toc(2, id, entry.title) + "\n";
        subsection = true;
        continue;
      }
      if (entry.type === "record") {
        const id = `kirillov-1559-${spec.key}-koshchievsky-${String(++recordCount).padStart(3, "0")}`;
        const headingId = `${id}-heading`;
        fragmentRows.push({ id, headingId, folio: entry.folio.replace(/\s+об\./u, "об.") });
        content += `<section class="record place-record" id="${id}"><div class="record-heading-line"><h3 class="record-title place-heading" id="${headingId}">${entry.pageMark ? `${page(entry.pageMark)} ` : ""}${headingText(entry.title)}</h3> <span class="heading-inline-prose">${escape(entry.tail)}</span></div><div class="record-body">\n`;
        contents += toc(3, headingId, entry.title) + "\n";
      }
      let pending = "";
      const paragraphs = [];
      for (const p of entry.paragraphs) {
        if (pending && /^(?:И |А )/u.test(p) && /^(?:И |А |З )/u.test(pending)) pending += ` ${p}`;
        else { if (pending) paragraphs.push(pending); pending = p; }
      }
      if (pending) paragraphs.push(pending);
      content += paragraphs.map((p) => `<p class="record-prose">${inline(p)}</p>`).join("\n") + "\n";
      if (entry.type === "record") content += "</div></section>\n";
    }
    if (subsection) content += "</div>\n";
    content += "</div>\n";
    if (recordCount !== spec.count) throw new Error(`Expected ${spec.count} ${spec.key} records, found ${recordCount}.`);
    const bodyIndex = html.indexOf(spec.boundary, html.indexOf('<div class="document-body">'));
    const tocIndex = html.indexOf(spec.tocBoundary, html.indexOf('id="document-contents"'));
    if (bodyIndex < 0 || tocIndex < 0 || tocIndex > bodyIndex) throw new Error(`Missing ${spec.key} insertion boundaries.`);
    html = html.slice(0, bodyIndex) + content + html.slice(bodyIndex);
    html = html.slice(0, tocIndex) + contents + html.slice(tocIndex);
  }
  const insert = db.prepare("INSERT INTO fragments (id, book_id, source_heading_id, folio, position, raw_json) VALUES (?, ?, ?, ?, ?, '{}')");
  db.prepare("UPDATE fragments SET position = -position WHERE book_id = ?").run(bookId);
  for (const [index, row] of fragmentRows.entries()) insert.run(row.id, bookId, row.headingId, row.folio, -10000 - index);
  const positions = new Map([...html.matchAll(/<section class="record place-record" id="([^"]+)">/gu)].map((m, i) => [m[1], i + 1]));
  const update = db.prepare("UPDATE fragments SET position = ? WHERE id = ?");
  for (const row of db.prepare("SELECT id FROM fragments WHERE book_id = ?").all(bookId)) {
    if (!positions.has(row.id)) throw new Error(`Missing source record ${row.id}.`);
    update.run(positions.get(row.id), row.id);
  }
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after adding the Koshchievsky sections.");
};
