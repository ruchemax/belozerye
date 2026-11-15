export const formatDocument = (html) => {
  let result = html.replace(/\[\d+(?:[¹²³]|[–-]\d+)?\s*:\s*/gu, "[");
  result = result.replace(/<h([1-3])\b[^>]*>[\s\S]*?<\/h\1>/gu, (heading) =>
    heading.replace(/<span class="source-note">(\[[^<\]]+\])<\/span>/gu, (note, text) =>
      text.startsWith("[Дополнено:") ? note : `<span class="name-variant">${text}</span>`));
  if (!result.includes('id="name-variant-style"')) {
    result = result.replace("</head>", '<style id="name-variant-style">.document-body :is(h1,h2,h3) .name-variant { font:inherit!important; color:inherit!important; }</style></head>');
  }
  return result;
};

export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(formatDocument(document.html), bookId);
};
