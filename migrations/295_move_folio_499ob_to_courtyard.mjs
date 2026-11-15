export const up = (db) => {
  const bookId = "belozersky-1544";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1544 book was not found.");
  const sectionPattern = /<section\b[^>]*\bid="place-2-1"[^>]*>[\s\S]*?<\/section>/u;
  const section = document.html.match(sectionPattern)?.[0];
  const markPattern = /<span class="page-mark"[^>]*>\(л\. 499об\.\)<\/span>/u;
  const mark = section?.match(markPattern)?.[0];
  if (!mark) throw new Error("Folio 499ob was not found in the Larino record.");
  const updated = section.replace(` ${mark}`, "")
    .replace(/(<p class="courtyard"[^>]*>)/u, `$1${mark} `);
  if (updated === section) throw new Error("Folio 499ob was not moved.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(section, updated), bookId);
};
