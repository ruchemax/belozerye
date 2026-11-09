export const up = (db) => {
  const places = db.prepare(`
    SELECT DISTINCT places.id, places.name
    FROM places
    JOIN mentions ON mentions.place_id = places.id
    JOIN fragments ON fragments.id = mentions.fragment_id
    WHERE places.name_origin = 'observed'
      AND fragments.book_id = 'belozersky-1626'
      AND fragments.source_heading_id LIKE 'folios-547-561-place-%-heading'
  `).all();
  const latestMention = db.prepare(`
    SELECT mentions.id
    FROM mentions
    JOIN fragments ON fragments.id = mentions.fragment_id
    JOIN books ON books.id = fragments.book_id
    WHERE mentions.place_id = ?
    ORDER BY CAST(books.year AS INTEGER) DESC, mentions.rowid ASC
    LIMIT 1
  `);
  const primaryName = db.prepare(`
    SELECT names.name
    FROM place_name_states AS states
    JOIN place_names AS names ON names.id = states.place_name_id
    WHERE states.source_mention_id = ? AND states.assertion_kind = 'observed'
    ORDER BY states.position, states.rowid
    LIMIT 1
  `);
  const updateName = db.prepare("UPDATE places SET name = ? WHERE id = ?");
  for (const place of places) {
    const mention = latestMention.get(place.id);
    const state = mention && primaryName.get(mention.id);
    if (!state?.name) throw new Error(`The latest observed name for ${place.id} was not found.`);
    updateName.run(state.name, place.id);
  }
};
