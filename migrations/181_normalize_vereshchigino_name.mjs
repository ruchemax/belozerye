export const up = (db) => {
  const placeId = "voroshnino";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-98";
  const mention = db.prepare("SELECT place_id, source_name FROM mentions WHERE id = ?").get(mentionId);
  if (mention?.place_id !== placeId || !mention.source_name.includes("Верещигино [Верещагино]")) {
    throw new Error("The merged Vereshchigino source entry was not found in its expected form.");
  }
  db.prepare("DELETE FROM place_name_states WHERE id = 'editorial:pustosh-vereshchigino-vereshchagino-1626-98'").run();
  db.prepare("DELETE FROM place_names WHERE id = 'editorial:pustosh-vereshchigino-vereshchagino-1626-98:Верещагино'").run();
  db.prepare("UPDATE places SET name = 'Верещигино', name_origin = 'observed' WHERE id = ?").run(placeId);
  db.prepare("UPDATE mentions SET source_name = replace(source_name, ' [Верещагино]', '') WHERE id = ?").run(mentionId);
  for (const document of db.prepare("SELECT book_id, html FROM book_documents").all()) {
    const html = document.html.replaceAll("Верещигино [Верещагино]", "Верещигино");
    if (html !== document.html) db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, document.book_id);
  }
};
