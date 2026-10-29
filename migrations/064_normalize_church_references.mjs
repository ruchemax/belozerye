const nativityChurchFragmentId = "belozersky-1544-nativity-church";

export const up = (db) => {
  db.exec("PRAGMA defer_foreign_keys = ON");

  db.exec(`
    INSERT INTO fragments (id, book_id, source_heading_id, folio, position, link_target_id, raw_json)
    VALUES (
      '${nativityChurchFragmentId}',
      'belozersky-1544',
      'nativity-church',
      '503',
      100,
      NULL,
      '{"id":"${nativityChurchFragmentId}","book_id":"belozersky-1544","heading_id":"nativity-church","folio":"503","order":100,"html":"","church_source_only":true}'
    );

    CREATE TABLE churches_new (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      location_place_id TEXT REFERENCES places(id) ON UPDATE CASCADE ON DELETE SET NULL
    );
    INSERT INTO churches_new (id, slug, name, location_place_id)
      SELECT id, slug, name, location_place_id FROM churches;

    CREATE TABLE church_sources_new (
      church_id TEXT NOT NULL REFERENCES churches_new(id) ON UPDATE CASCADE ON DELETE CASCADE,
      fragment_id TEXT NOT NULL REFERENCES fragments(id) ON UPDATE CASCADE ON DELETE CASCADE,
      PRIMARY KEY (church_id, fragment_id)
    );
    INSERT INTO church_sources_new (church_id, fragment_id)
      SELECT church_sources.church_id, fragments.id
      FROM church_sources
      JOIN books ON books.slug = church_sources.book_slug
      JOIN fragments
        ON fragments.book_id = books.id
        AND fragments.source_heading_id = church_sources.source_anchor
      WHERE NOT (
        church_sources.church_id = 'rozhdestva-bogoroditsy-churovskaya'
        AND church_sources.book_slug = 'belozersky_uezd-1544'
        AND church_sources.source_anchor = 'nativity-church'
      );
    INSERT INTO church_sources_new (church_id, fragment_id)
      VALUES ('rozhdestva-bogoroditsy-churovskaya', '${nativityChurchFragmentId}');

    CREATE TABLE church_geometries_new (
      church_id TEXT PRIMARY KEY REFERENCES churches_new(id) ON UPDATE CASCADE ON DELETE CASCADE,
      longitude REAL NOT NULL,
      latitude REAL NOT NULL,
      source TEXT NOT NULL
    );
    INSERT INTO church_geometries_new (church_id, longitude, latitude, source)
      SELECT church_id, longitude, latitude, source FROM church_geometries;

    DROP TABLE church_sources;
    DROP TABLE church_geometries;
    DROP TABLE churches;
    ALTER TABLE churches_new RENAME TO churches;
    ALTER TABLE church_sources_new RENAME TO church_sources;
    ALTER TABLE church_geometries_new RENAME TO church_geometries;
  `);

  const expectedSources = 8;
  const actualSources = db.prepare("SELECT COUNT(*) AS count FROM church_sources").get().count;
  if (actualSources !== expectedSources) {
    throw new Error(`Перенесено источников церквей: ${actualSources}; ожидалось: ${expectedSources}.`);
  }
  const violations = db.prepare("PRAGMA foreign_key_check").all();
  if (violations.length) throw new Error("Нарушены внешние ключи после переноса церквей.");
};
