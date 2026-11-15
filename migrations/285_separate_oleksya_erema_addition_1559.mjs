export const formatDocument = (html) => html.replace(
  / (<span class="source-note">\[Дополнено: <strong class="person-name">Олекся<\/strong> да <strong class="person-name">Ерема<\/strong> на полвыти, ржи четь, овса 2 чети\.\]<\/span>) (И всех семян ржи 4 чети, овса 8 чети\.)/u,
  '</p>\n<p class="record-prose">$1</p>\n<p class="record-prose">$2'
);

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
