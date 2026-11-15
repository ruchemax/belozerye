export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const pattern = /(<section class="record place-record" id="kirillov-1559-fragment-skorobagatoe">[\s\S]*?)<\/section>/u;
  const section = document.html.match(pattern)?.[0];
  const note = "[Дополнено на левом поле другим почерком:]";
  const ending = "осмина ячменя.</span>";
  if (!section?.includes(note) || !section.includes(ending)) {
    throw new Error("The Skorobagatoe addition boundaries were not found.");
  }
  const updated = section.replace(note, "[Дополнено на левом поле другим почерком:")
    .replace(ending, "осмина ячменя.]</span>");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(section, updated), bookId);
};
