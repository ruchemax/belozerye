export const formatDocument = (html) => {
  const original = '<p class="record-prose"><span class="page-mark">(л. 40об.)</span> И всего на Сизме';
  if (!html.includes(original)) throw new Error("The 1601 village summary was not found.");
  return html.replace(original, '<p class="record-prose" id="census-villages-summary"><span class="page-mark">(л. 40об.)</span> И всего на Сизме')
    .replace("</head>", '<style id="census-villages-summary-style">.document-body #census-villages-summary { margin-block-start:1.5rem!important; }</style></head>');
};

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(formatDocument(document.html),bookId);
};
