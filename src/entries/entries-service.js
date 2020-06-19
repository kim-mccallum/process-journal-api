const EntriesService = {
  getAllEntries(knex) {
    // return knex.select("*").from("entries");
    return knex
      .from("entries")
      .innerJoin(
        "journal_settings",
        "entries.journal_id",
        "journal_settings.id"
      )
      .select("*")
      .from("entries");
  },
  getByUserId(knex, userId) {
    // add journal_settings join SOON
    return knex
      .from("entries")
      .innerJoin(
        "journal_settings",
        "entries.journal_id",
        "journal_settings.id"
      )
      .select("*")
      .where("entries.user_id", userId);
    // .first();
  },
  createEntry(knex, newEntry) {
    return knex
      .insert(newEntry)
      .into("entries")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = EntriesService;
