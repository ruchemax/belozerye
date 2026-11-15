export const formatDocument = (html) => html.replace(
  /(<section class="record place-record" id="kirillov-1559-fragment-058"><div class="record-heading-line">)([\s\S]*?)(<\/div>)/u,
  (_match, opening, line, closing) => {
    const note = "в рукописи на верхнем поле каждого листа 128–130 другим почерком: Запогостье";
    if (!line.includes(`(${note})`)) return opening + line + closing;
    const updated = line.replace(` (${note})`, "")
      .replace('<span class="page-mark">(л. 128)</span>',
        `<span class="page-mark">(л. 128)</span> <span class="source-note">[${note}]</span>`);
    return opening + updated + closing;
  }
);

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
