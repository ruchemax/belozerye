export const up = (db) => {
  const ownerId = "tserkov-rozhdestva-bogoroditsy-pogost-rozhdestva-bogoroditsy-luzhkovo";
  db.prepare(`
    DELETE FROM mention_land_category_owners
    WHERE mention_id = ? AND land_category_position = ? AND land_owner_id = ?
  `).run("mention-belozersky-1626-patriarchal-churchyard-loshakovo", 0, ownerId);
  db.prepare("DELETE FROM land_owner_places WHERE land_owner_id = ? AND place_id = ?")
    .run(ownerId, "pogost-rozhestva-bogoroditsy");
};
