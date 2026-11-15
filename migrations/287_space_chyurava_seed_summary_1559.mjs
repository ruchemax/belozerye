export const formatDocument = (html) => {
  let result = html.replace(
    '<p class="record-prose">И всех деревень в Чюравском ключе 35',
    '<p class="record-prose" id="chyurava-seed-summary">И всех деревень в Чюравском ключе 35'
  );
  if (!result.includes('id="chyurava-seed-summary-style"')) {
    result = result.replace("</head>", '<style id="chyurava-seed-summary-style">.document-body #chyurava-seed-summary { margin-block-start:1.5rem!important; }</style></head>');
  }
  return result;
};

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
