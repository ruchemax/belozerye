export const up = (db) => {
  db.exec(`
    CREATE TABLE mention_place_links (
      mention_id TEXT PRIMARY KEY REFERENCES mentions(id) ON DELETE CASCADE,
      place_id TEXT NOT NULL REFERENCES places(id) ON UPDATE CASCADE ON DELETE CASCADE,
      status TEXT NOT NULL CHECK (status IN ('exact', 'probable', 'unreviewed')),
      rationale TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX mention_place_links_place_idx ON mention_place_links(place_id, status);
  `);

  db.prepare(`
    INSERT INTO mention_place_links (mention_id, place_id, status, rationale)
    SELECT id, place_id, 'unreviewed', 'Перенесено из прежней связи mentions.place_id; степень уверенности не была указана.'
    FROM mentions
  `).run();
};
