export const up = (db) => {
  db.prepare(`
    UPDATE place_names
    SET name = ?
    WHERE id IN (
      SELECT place_name_id
      FROM place_name_states
      WHERE place_id = ?
    ) AND name = ?
  `).run("Рождества Богородицы", "pogost-rozhestva-bogoroditsy", "Рожества Богородицы");
};
