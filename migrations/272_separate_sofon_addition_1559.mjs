export const formatDocument = (html) => html.replace(
  /(<p class="record-prose">[\s\S]*?) (<span class="source-note">\[Дополнено: <strong class="person-name">Софон<\/strong> на треть полвыти ржы осмина с третником, ячмени третник, овса 2 чети\.\]<\/span>) (И всех симян ржы 2 чети, ячмени осмина, овса 6 чети\.<\/p>)/u,
  '$1</p>\n<p class="record-prose">$2</p>\n<p class="record-prose">$3'
);

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
