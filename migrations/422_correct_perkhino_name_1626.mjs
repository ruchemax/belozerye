export const up = (db) => {
  const bookId = "belozersky-1626";
  const placeId = "pustosh-perkhito-1626-61";
  const fragmentId = "belozersky-1626-fragment-folios-547-561-place-61";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-61";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id=?").get(fragmentId);
  if (!document || !fragment || !document.html.includes("Пустошь Перхито")) {
    throw new Error("The 1626/27 Perkhito record was not found.");
  }
  const sourceName = "Пустошь Перхито [Перхино]";
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?")
    .run(document.html.replaceAll("Пустошь Перхито", 'Пустошь Перхито <span class="name-variant">[Перхино]</span>'),bookId);
  db.prepare("UPDATE mentions SET source_name=?,historical_name_override='Пустошь Перхино' WHERE id=?").run(sourceName,mentionId);
  db.prepare("UPDATE fragments SET raw_json=? WHERE id=?")
    .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: sourceName }),fragmentId);
  let nameId = db.prepare("SELECT id FROM place_names WHERE place_id=? AND name='Перхино'").get(placeId)?.id;
  if (!nameId) {
    nameId = "attested:perkhino:1626-61";
    db.prepare("INSERT INTO place_names (id,place_id,name,language,name_kind) VALUES (?,?,'Перхино','ru','attested')").run(nameId,placeId);
  }
  db.prepare("UPDATE place_name_states SET place_name_id=? WHERE source_mention_id=?").run(nameId,mentionId);
  db.prepare("UPDATE places SET name='Перхино',name_origin='observed' WHERE id=?").run(placeId);
  db.prepare(`DELETE FROM place_names WHERE place_id=? AND name='Перхито'
    AND NOT EXISTS (SELECT 1 FROM place_name_states WHERE place_name_id=place_names.id)`).run(placeId);
};
