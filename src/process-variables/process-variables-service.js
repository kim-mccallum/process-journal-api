const ProcessVariablesService = {
  // Not currently using this
  getAllVariables(knex) {
    return knex.select("*").from("process_variables");
  },
  //   make sure that this returns ALL the goals - NOT BEING USED CURRENTLY
  getAllByUserId(knex, userId) {
    return knex.from("process_variables").select("*").where("user_id", userId);
  },
  //   add logic so that this returns only the most recent goal
  getCurrentByUserId(knex, userId) {
    return knex.raw(
      "select * from process_variables pv1 where pv1.user_id = 1 and pv1.date = (select max(pv2.date) from process_variables pv2 where pv2.user_id = pv1.user_id);"
    );
  },
  createVariable(knex, newVariable) {
    return knex
      .insert(newVariable)
      .into("process_variables")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

// MAYBE MAKE ANOTHER ENDPOINT TO GET ALL THE VARIABLES

module.exports = ProcessVariablesService;
