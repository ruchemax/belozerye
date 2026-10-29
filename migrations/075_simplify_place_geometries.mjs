export const up = (db) => {
  db.exec(`
    CREATE TABLE place_geometries_new (
      place_id TEXT PRIMARY KEY REFERENCES places(id) ON DELETE CASCADE,
      longitude REAL NOT NULL,
      latitude REAL NOT NULL
    );
    INSERT INTO place_geometries_new (place_id, longitude, latitude)
      SELECT
        place_id,
        json_extract(geometry_json, '$.coordinates[0]'),
        json_extract(geometry_json, '$.coordinates[1]')
      FROM place_geometries;
    DROP TABLE place_geometries;
    ALTER TABLE place_geometries_new RENAME TO place_geometries;
  `);
};
