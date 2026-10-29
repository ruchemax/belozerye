CREATE TABLE place_names (
  id TEXT PRIMARY KEY,
  place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ru',
  name_kind TEXT NOT NULL DEFAULT 'historical',
  is_preferred INTEGER NOT NULL DEFAULT 0 CHECK (is_preferred IN (0, 1)),
  source_mention_id TEXT REFERENCES mentions(id) ON DELETE SET NULL
);

CREATE INDEX place_names_place_idx ON place_names(place_id, name_kind);

INSERT INTO place_names (id, place_id, name)
SELECT 'legacy:' || place_id || ':' || position, place_id, name
FROM place_name_variants;

ALTER TABLE mentions ADD COLUMN target_anchor TEXT;
ALTER TABLE mentions ADD COLUMN context_note TEXT;
ALTER TABLE mentions ADD COLUMN folio_override TEXT;

UPDATE mentions
SET target_anchor = (
  SELECT fragments.heading_id
  FROM fragments
  WHERE fragments.id = mentions.fragment_id
)
WHERE target_anchor IS NULL;

CREATE INDEX mentions_target_anchor_idx ON mentions(fragment_id, target_anchor);
