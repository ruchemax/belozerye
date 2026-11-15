export const up = (db) => {
  const result = db.prepare(`UPDATE mention_administrative_units SET display_label='Запогостье'
    WHERE display_label='тянут к Запогостью' AND administrative_unit_id='subdivision:Запогостье'`).run();
  if (result.changes === 0) throw new Error("No Zapogostye affiliation labels were found.");
};
