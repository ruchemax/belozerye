export const formatDocument = (html) => {
  const opening = '<p class="record-prose">И всех деревень в Чаромском ключе 40';
  if (!html.includes(opening)) throw new Error("The Charoma seed summary was not found.");
  return html.replace(opening,
    '<p class="record-prose" id="charoma-seed-summary">И всех деревень в Чаромском ключе 40')
    .replace("</head>", '<style id="charoma-seed-summary-style">.document-body #charoma-seed-summary { margin-block-start:1.5rem!important; }</style></head>');
};

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(formatDocument(document.html), bookId);
};
