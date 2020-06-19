const JournalSettingsService = {
  getAllSettings(knex) {
    return knex.select("*").from("journal_settings");
  },
  createSetting(knex, newSetting) {
    return knex
      .insert(newSetting)
      .into("journal_settings")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getByUserId(knex, userId) {
    return knex
      .from("journal_settings")
      .select("*")
      .where("user_id", userId)
      .first();
  },
  //   Not using these below yet
  deleteSetting(knex, id) {
    return knex("journal_settings").where({ id }).delete();
  },
  updateSetting(knex, id, newSettingFields) {
    return knex("journal_settings").where({ id }).update(newSettingFields);
  },
};

module.exports = JournalSettingsService;
