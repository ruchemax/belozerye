import { readFile } from "node:fs/promises";

export const up = async (db) => {
  const bookId = "kirillov-1559";
  const html = await readFile(new URL("../content/books/kirillov_monastery-1559/index.html", import.meta.url), "utf8");
  const title = "Вытные книги Кириллова монастыря (1559 г.)";
  db.prepare(`INSERT INTO books
    (id, slug, year, full_title, short_title, archive_reference, publication_reference, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    bookId, "kirillov_monastery-1559", "1559", title, title, null,
    "Вотчинные хозяйственные книги XVI в.: Вытные книги. Хлебные оброчники и переписная книга вотчин Кирилло-Белозерского монастыря 1559–1601 гг. / сост. А.Х. Горфункель, З.В. Дмитриева; под ред. А.Г. Манькова. Москва; Ленинград, 1983. С. 99–111, 230–242.",
    JSON.stringify({ period_label: "вытных книг Кириллова монастыря 1559 года", folio_space_before_reverse: true })
  );
  db.prepare("INSERT INTO book_documents (book_id, html) VALUES (?, ?)").run(bookId, html);
  const insert = db.prepare(`INSERT INTO fragments
    (id, book_id, source_heading_id, folio, position, raw_json) VALUES (?, ?, ?, ?, ?, ?)`);
  const textStart = html.indexOf('<div class="document-body">');
  let position = 0;
  for (const match of html.matchAll(/<section class="record place-record" id="(kirillov-1559-fragment-\d+)">/gu)) {
    const previousText = html.slice(textStart, match.index);
    const folio = [...previousText.matchAll(/<span class="page-mark">\(л\. ([^)]+)\)<\/span>/gu)].at(-1)?.[1];
    if (!folio) throw new Error(`Missing folio before ${match[1]}.`);
    insert.run(match[1], bookId, `${match[1]}-heading`, folio, ++position, "{}");
  }
  if (position !== 132) throw new Error(`Expected 132 source records, found ${position}.`);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after adding the 1559 book.");
};
