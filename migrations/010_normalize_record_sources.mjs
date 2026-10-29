const columns = (db, table) => new Set(
  db.prepare(`PRAGMA table_info("${table}")`).all().map((column) => column.name)
);

export const up = (db) => {
  const mentionColumns = columns(db, "mentions");
  db.exec(`
    UPDATE books SET raw_json = json_remove(raw_json,
      '$.id', '$.slug', '$.title', '$.card_title', '$.full_title', '$.short_title', '$.year',
      '$.archive_reference', '$.publication_reference');
    UPDATE places SET raw_json = json_remove(raw_json,
      '$.id', '$.slug', '$.name', '$.preferred_name', '$.main_name', '$.name_variants',
      '$.type', '$.status', '$.canonical_name', '$.source_book_id');
    UPDATE fragments SET raw_json = json_remove(raw_json,
      '$.id', '$.book_id', '$.folio', '$.order', '$.html', '$.source_heading_id', '$.heading_id', '$.link_target_id');
    UPDATE mentions SET raw_json = '{}';
  `);
  if (mentionColumns.has("source_context_json")) db.exec("ALTER TABLE mentions DROP COLUMN source_context_json");
};
