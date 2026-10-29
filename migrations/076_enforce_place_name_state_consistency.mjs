export const up = (db) => {
  db.exec(`
    CREATE UNIQUE INDEX place_names_id_place_id_unique
      ON place_names(id, place_id);
    CREATE UNIQUE INDEX mentions_id_place_id_unique
      ON mentions(id, place_id);

    CREATE TABLE place_name_states_new (
      id TEXT PRIMARY KEY,
      place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      place_name_id TEXT NOT NULL REFERENCES place_names(id) ON DELETE CASCADE,
      type_code TEXT REFERENCES place_types(code),
      source_mention_id TEXT REFERENCES mentions(id) ON DELETE SET NULL,
      observed_year TEXT,
      display_period TEXT,
      assertion_kind TEXT NOT NULL CHECK (assertion_kind IN ('observed', 'inferred', 'editorial')),
      position INTEGER NOT NULL,
      FOREIGN KEY (place_name_id, place_id)
        REFERENCES place_names(id, place_id),
      FOREIGN KEY (source_mention_id, place_id)
        REFERENCES mentions(id, place_id)
    );
    INSERT INTO place_name_states_new (
      id, place_id, place_name_id, type_code, source_mention_id,
      observed_year, display_period, assertion_kind, position
    )
      SELECT
        id, place_id, place_name_id, type_code, source_mention_id,
        observed_year, display_period, assertion_kind, position
      FROM place_name_states;
    DROP TABLE place_name_states;
    ALTER TABLE place_name_states_new RENAME TO place_name_states;
    CREATE INDEX place_name_states_place_idx ON place_name_states(place_id, position);
    CREATE INDEX place_name_states_source_mention_idx ON place_name_states(source_mention_id);
  `);

  const violations = db.prepare("PRAGMA foreign_key_check").all();
  if (violations.length) throw new Error("Нарушены внешние ключи состояний названий.");
};
