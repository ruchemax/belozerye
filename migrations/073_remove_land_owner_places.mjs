export const up = (db) => {
  const multipleLocations = db.prepare(`
    SELECT land_owner_id
    FROM land_owner_places
    GROUP BY land_owner_id
    HAVING COUNT(*) > 1
  `).all();
  if (multipleLocations.length) throw new Error("Невозможно удалить land_owner_places: у владельца несколько населённых пунктов.");

  db.exec(`
    ALTER TABLE land_owners
      ADD COLUMN location_place_id TEXT REFERENCES places(id) ON UPDATE CASCADE ON DELETE SET NULL;
    UPDATE land_owners
    SET location_place_id = (
      SELECT place_id
      FROM land_owner_places
      WHERE land_owner_places.land_owner_id = land_owners.id
    )
    WHERE EXISTS (
      SELECT 1
      FROM land_owner_places
      WHERE land_owner_places.land_owner_id = land_owners.id
    );
    DROP TABLE land_owner_places;
  `);
};
