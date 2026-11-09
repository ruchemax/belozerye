export const up = (db) => {
  const bookId = "belozersky-1626";
  const fragmentId = "belozersky-1626-fragment-folios-547-561-place-19";
  const targetId = "belaya-place-name";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id = ?").get(fragmentId);
  const original = '<span data-astro-cid-zcak6nys>пустошь Белая</span>';
  if (!document?.html.includes(original) || !fragment) throw new Error("The Belaya source heading was not found.");
  let html = document.html.replace(original, `<span id="${targetId}" data-astro-cid-zcak6nys>пустошь Белая</span>`);
  html = html.replace(/(<a\b[^>]*href="#folios-547-561-place-19-heading"[^>]*>)[\s\S]*?(<\/a>)/u, '$1Пустошь Белая$2');
  db.prepare("UPDATE fragments SET link_target_id = ?, raw_json = ? WHERE id = ?")
    .run(targetId, JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: "пустошь Белая" }), fragmentId);
  db.prepare("UPDATE mentions SET source_name = 'пустошь Белая' WHERE fragment_id = ?").run(fragmentId);
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
