export const formatDocument = (html) => {
  const start = html.indexOf('<p class="record-prose">И всех деревень в Чаромском ключе 40');
  const finalSentence = html.indexOf("А сеют крестьяне в тех деревнях на своих пашнях монастырских симян", start);
  const end = html.indexOf("</p>", finalSentence) + 4;
  if (start < 0 || finalSentence < 0 || end < 4) throw new Error("The Charoma seed summary was not found.");
  return html.slice(0, start) + html.slice(start, end).replace(/<\/p>\s*<p class="record-prose">/gu, " ") + html.slice(end);
};

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
