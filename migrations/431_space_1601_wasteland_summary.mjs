export const formatDocument = (html) => {
  const original = '<p class="record-prose">И всего пуста в Чяромских и на Колинце,';
  if (!html.includes(original)) throw new Error("The 1601 wasteland summary was not found.");
  return html.replace(original, '<p class="record-prose" id="census-wastelands-summary">И всего пуста в Чяромских и на Колинце,')
    .replace("</head>", '<style id="census-wastelands-summary-style">.document-body #census-wastelands-summary { margin-block-start:1.5rem!important; }</style></head>');
};

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(formatDocument(document.html),bookId);
};
