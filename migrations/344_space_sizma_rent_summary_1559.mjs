export const formatDocument = (html) => {
  const opening = '<p class="record-prose"><span class="page-mark">(л. 254)</span> И всего к селу к Сезме 6 ключей.';
  if (!html.includes(opening)) throw new Error("The Sizma rent summary was not found.");
  return html.replace(opening,
    '<p class="record-prose" id="sizma-rent-summary"><span class="page-mark">(л. 254)</span> И всего к селу к Сезме 6 ключей.')
    .replace("</head>", '<style id="sizma-rent-summary-style">.document-body #sizma-rent-summary { margin-block-start:1.5rem!important; }</style></head>');
};

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(formatDocument(document.html), bookId);
};
