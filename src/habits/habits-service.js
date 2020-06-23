const HabitsService = {
  // Not currently using this
  getAllHabits(knex) {
    return knex.select("*").from("habits");
  },
  //   make sure that this returns ALL the habits - NOT BEING USED CURRENTLY
  getAllHabitsByUserId(knex, userId) {
    return knex.from("habits").select("*").where("user_id", userId);
  },
  //   add logic so that this returns only the most recent habit
  getCurrentHabitByUserId(knex, userId) {
    return knex.raw(
      `select * from habits habit1 where habit1.user_id = ${userId} and habit1.date = (select max(habit2.date) from habits habit2 where habit2.user_id = habit1.user_id);`
    );
  },
  createHabit(knex, newHabit) {
    return knex
      .insert(newHabit)
      .into("habits")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = HabitsService;
