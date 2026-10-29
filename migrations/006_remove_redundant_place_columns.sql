ALTER TABLE places DROP COLUMN canonical_name;
ALTER TABLE places DROP COLUMN source_book_id;

UPDATE places
SET raw_json = json_remove(raw_json, '$.canonical_name', '$.source_book_id');
