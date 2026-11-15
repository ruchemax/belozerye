export const up = (db) => {
  const states = db.prepare(`
    SELECT m.id, m.place_id, m.match_reliability, f.book_id, n.name
    FROM mentions m
    JOIN fragments f ON f.id = m.fragment_id
    JOIN place_name_states s ON s.source_mention_id = m.id
    JOIN place_names n ON n.id = s.place_name_id
    WHERE s.assertion_kind = 'observed'
  `).all();
  const normalize = (name) => name.trim().replace(/\s+/gu, " ").toLocaleLowerCase("ru-RU");
  const confirmed = new Set(states.filter((state) => state.match_reliability === "probable"
    && states.some((other) => other.place_id === state.place_id
      && other.book_id !== state.book_id && normalize(other.name) === normalize(state.name)))
    .map((state) => state.id));
  const update = db.prepare("UPDATE mentions SET match_reliability = 'exact', match_reason = NULL WHERE id = ?");
  for (const id of confirmed) update.run(id);
  console.log(`Confirmed matching historical names: ${confirmed.size} mentions.`);
};
