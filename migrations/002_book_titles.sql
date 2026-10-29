ALTER TABLE books ADD COLUMN full_title TEXT;

UPDATE books
SET full_title = title
WHERE full_title IS NULL OR trim(full_title) = '';

UPDATE books
SET short_title = COALESCE(NULLIF(trim(short_title), ''), NULLIF(trim(card_title), ''), full_title)
WHERE short_title IS NULL OR trim(short_title) = '';
