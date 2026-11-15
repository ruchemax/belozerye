export const formatDocument = (html) => {
  const start = html.indexOf('<p class="record-prose">И всех деревень оброчных в Чюравском ключе 22.');
  const finalSentence = html.indexOf("И всего всякого хлеба оброчнего з Сезмы", start);
  const end = html.indexOf("</p>", finalSentence) + 4;
  if (start < 0 || finalSentence < 0 || end < 4) throw new Error("The final 1559 rent summary was not found.");
  const summary = html.slice(start, end)
    .replace(/<\/p>\s*<p class="record-prose">/gu, " ")
    .replace(' <span class="page-mark">(л. 254)</span>', '</p>\n<p class="record-prose"><span class="page-mark">(л. 254)</span>');
  return html.slice(0, start) + summary + html.slice(end);
};

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
