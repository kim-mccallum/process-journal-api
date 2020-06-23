const EntriesService = {
  getAllEntries(knex, query) {
    // destructure start and end parameters
    let { start, end } = query;
    // if they exist, convert them to the right date format for a query - COME BACK TO THIS AFTER WORKING ON THE CLIENT
    if (start && end) {
      return knex
        .from("entries")
        .select("*")
        .where("date", ">=", start)
        .where("date", "<=", end);
    }
    return knex.select("*").from("entries");
  },
  getByUserId(knex, userId, query) {
    // destructure start and end parameters
    let { start, end } = query;
    // if they exist, convert them to the right date format for a query - COME BACK TO THIS AFTER WORKING ON THE CLIENT
    if (start && end) {
      // just examples - check the format from MomentJS first!
      console.log("IF YOU SEND/RECEIVE UTC, YOU SHOULDN'T HAVE TO CONVERT");

      return knex
        .from("entries")
        .select("*")
        .where("user_id", userId)
        .where("date", ">=", start)
        .where("date", "<=", end);
    }
    return knex.from("entries").select("*").where("user_id", userId);
  },
  // add a method for checking if the date exists already prior to posting
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
