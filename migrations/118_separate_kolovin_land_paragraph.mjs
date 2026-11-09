export const up = (db) => {
  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const original = 'Тимофей Иванов</span>. Да место дворовое старые пустоты. Пашни поповы паханые середние земли двенатцеть четвертей в поле, а в дву по тому ж. Сена тритцать копен.</p>';
  if (!document?.html.includes(original)) throw new Error("The Kolovin land paragraph was not found.");
  const replacement = 'Тимофей Иванов</span>.</p><p class="no-indent" data-astro-cid-zcak6nys>Да место дворовое старые пустоты. Пашни поповы паханые середние земли двенатцеть четвертей в поле, а в дву по тому ж. Сена тритцать копен.</p>';
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(original, replacement), bookId);
};
