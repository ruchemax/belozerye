export const up = (db) => {
  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1626 book document was not found.");

  let correctedCount = 0;
  const html = document.html.replace(
    /(<a\b(?=[^>]*\bhref="#folios-547-561-place-(?:58|59|60|61|62)-heading")[^>]*>)([\s\S]*?)(<\/a>)/gu,
    (entry, opening, label, closing) => {
      const corrected = label.replace(/\s+лесом поросла большим\.?\s*$/u, "");
      if (corrected !== label) correctedCount += 1;
      return `${opening}${corrected}${closing}`;
    }
  );
  if (correctedCount !== 5) {
    throw new Error(`Expected five wasteland contents labels, found ${correctedCount}.`);
  }
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
