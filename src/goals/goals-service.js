const GoalsService = {
  // Not currently using this
  getAllGoalsByUserId(knex) {
    return knex.select("*").from("goals");
  },
  //   make sure that this returns ALL the goals - NOT BEING USED CURRENTLY
  getAllByUserId(knex, userId) {
    return knex.from("goals").select("*").where("user_id", userId);
  },
  //   add logic so that this returns only the most recent goal
  getCurrentByUserId(knex, userId) {
    return knex.raw(
      "select * from goals goal1 where goal1.user_id = 1 and goal1.date = (select max(goal2.date) from goals goal2 where goal2.user_id = goal1.user_id);"
    );
  },
  createGoal(knex, newGoal) {
    return knex
      .insert(newGoal)
      .into("goals")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = GoalsService;
