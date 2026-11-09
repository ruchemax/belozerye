export const up = (db) => {
  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const original = 'а в нем</p><p class="courtyard" data-astro-cid-zcak6nys>во дворе поп <span class="person-name" data-astro-cid-zcak6nys>Тимофей Иванов</span>';
  if (!document?.html.includes(original)) throw new Error("The Kolovin priest line was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(original, 'а в нем во дворе поп <span class="person-name" data-astro-cid-zcak6nys>Тимофей Иванов</span>'), bookId);
};
