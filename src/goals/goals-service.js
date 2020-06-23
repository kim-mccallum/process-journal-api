const GoalsService = {
  // to return all - Not being used
  getAllGoalsByUserId(knex) {
    return knex.select("*").from("goals");
  },
  //   make sure that this returns ALL the goals for the user
  getAllByUserId(knex, userId) {
    return knex.from("goals").select("*").where("user_id", userId);
  },
  //   add logic so that this returns only the most recent goal
  getCurrentByUserId(knex, userId) {
    // query to select user id first then select max date within selection
    return knex.raw(
      `select * from goals goal1 where goal1.user_id = ${userId} and goal1.date = (select max(goal2.date) from goals goal2 where goal2.user_id = goal1.user_id);`
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
