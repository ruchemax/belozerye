import { readFile } from "node:fs/promises";

export const up = async (db) => {
  const bookId = "kirillov-1601";
  const html = await readFile(new URL("../content/books/kirillov_monastery-1601/index.html", import.meta.url), "utf8");
  db.prepare(`INSERT INTO books
    (id, slug, year, full_title, short_title, archive_reference, publication_reference, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    bookId, "kirillov_monastery-1601", "1601",
    "Переписная книга вотчин Кирилова монастыря М.В. Молчанова и В. Нелюбова (1601).",
    "Переписная книга Кирилова монастыря (1601)", null,
    "Переписная книга вотчин 1601 г. // Горфункель А.Х., Дмитриева З.В. (сост.). Вотчинные хозяйственные книги XVI в.: Вытные книги. Хлебные оброчники и переписная книга вотчин Кирилло-Белозерского монастыря 1559–1601 гг. / под ред. А.Г. Манькова. Москва; Ленинград, 1983. С. 377–381 (л. 37об.–45).",
    JSON.stringify({ period_label: "переписной книги Кирилова монастыря 1601 года" })
  );
  db.prepare("INSERT INTO book_documents (book_id, html) VALUES (?, ?)").run(bookId, html);
  const insert = db.prepare(`INSERT INTO fragments
    (id, book_id, source_heading_id, folio, position, raw_json) VALUES (?, ?, ?, ?, ?, ?)`);
  const textStart = html.indexOf('<div class="document-body">');
  let position = 0;
  for (const match of html.matchAll(/<section class="record place-record" id="(kirillov-1601-fragment-\d+)">/gu)) {
    const headingEnd = html.indexOf("</h3>", match.index);
    const precedingText = html.slice(textStart, headingEnd);
    const folio = [...precedingText.matchAll(/<span class="page-mark">\(л\. ([^)]+)\)<\/span>/gu)].at(-1)?.[1];
    if (!folio) throw new Error(`Missing folio for ${match[1]}.`);
    insert.run(match[1], bookId, `${match[1]}-heading`, folio, ++position, "{}");
  }
  if (position !== 103) throw new Error(`Expected 103 source records, found ${position}.`);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after adding the 1601 book.");
};
