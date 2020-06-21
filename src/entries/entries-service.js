const EntriesService = {
  getAllEntries(knex) {
    return knex.select("*").from("entries");
  },
  getByUserId(knex, userId) {
    return knex.from("entries").select("*").where("user_id", userId);
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
