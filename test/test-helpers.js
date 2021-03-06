const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../src/config");

function makeUsersArray() {
  return [
    {
      id: 1,
      username: "test-user-1",
      password: "password",
      email: "test@email.com",
    },
    // {
    //   id: 2,
    //   user_name: "test-user-2",
    //   password: "password",
    //   date_created: new Date("2029-01-22T16:28:32.615Z"),
    // },
  ];
}

function makeGoalsArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      date: new Date("2029-01-22T16:28:32.615Z"),
      goal: "First goal",
    },
    {
      id: 2,
      user_id: users[0].id,
      date: new Date("2030-01-22T16:28:32.615Z"),
      goal: "Current goal",
    },
  ];
}

function makeHabitsArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      date: new Date("2029-01-22T16:28:32.615Z"),
      habit: "First habit",
    },
    {
      id: 2,
      user_id: users[0].id,
      date: new Date("2030-01-22T16:28:32.615Z"),
      habit: "Current habit",
    },
  ];
}

function makeProcessVariablesArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      date: new Date("2029-01-22T16:28:32.615Z"),
      process_variable: "Current process variable",
    },
    {
      id: 2,
      user_id: users[0].id,
      date: new Date("2030-01-22T16:28:32.615Z"),
      process_variable: "Current process variable",
    },
  ];
}

function makeEntriesArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      date: new Date("2029-01-22T16:28:32.615Z"),
      type: "variable",
      variable: "First entry",
      value: "1",
    },
    {
      id: 2,
      user_id: users[0].id,
      date: new Date("2030-01-22T16:28:32.615Z"),
      type: "variable",
      variable: "Second entry",
      value: "2",
    },
  ];
}

function makeJournalFixtures() {
  const testUsers = makeUsersArray();
  const testGoals = makeGoalsArray(testUsers);
  const testProcessVariables = makeProcessVariablesArray(testUsers);
  const testHabits = makeHabitsArray(testUsers);
  const testEntries = makeEntriesArray(testUsers);
  return {
    testUsers,
    testGoals,
    testProcessVariables,
    testHabits,
    testEntries,
  };
}

// DB SETUP FUNCTIONS
function cleanTables(db) {
  return db.raw(
    `TRUNCATE users, goals, process_variables, habits, entries RESTART IDENTITY CASCADE`
  );
}
// Maybe add the other seed function?
function seedDbTables(db, users, goals, process_variables, habits, entries) {
  return db.transaction(async (trx) => {
    //users
    await trx.into("users").insert(users);
    await trx.raw(`SELECT setval('users_id_seq', ?)`, [
      users[users.length - 1].id,
    ]);
    //goals
    await trx.into("goals").insert(goals);
    await trx.raw(`SELECT setval('goals_id_seq', ?)`, [
      goals[goals.length - 1].id,
    ]);
    //process_variables
    await trx.into("process_variables").insert(process_variables);
    await trx.raw(`SELECT setval('process_variables_id_seq', ?)`, [
      process_variables[process_variables.length - 1].id,
    ]);
    //habits
    await trx.into("habits").insert(habits);
    await trx.raw(`SELECT setval('habits_id_seq', ?)`, [
      habits[habits.length - 1].id,
    ]);
    // entries
    await trx.into("entries").insert(entries);
    await trx.raw(`SELECT setval('entries_id_seq', ?)`, [
      entries[entries.length - 1].id,
    ]);
  });
}

//function to seed the db
function seedUsers(db, users) {
  const preparedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into("users")
    .insert(preparedUsers)
    .then(() => {
      //update the id sequenc to stay in sync ??? CHECK THIS
      db.raw(`SELECT setval(id, ?)`, [users[users.length - 1].id]);
    });
}

function makeAuthHeader(user, secret = config.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

// DO I NEED MORE FUNCTIONS TO MAKE MAKE EXPECTED STUFF? I THINK I'M FINE WITH JUST USERS, GOALS, HABITS, PROCESS_VARIABLES AND ENTRIES
// THIS DOESN'T SEEM RIGHT
function makeExpectedGoal(users, goal) {
  const journalUser = users.find((user) => user.id === goal.user_id);

  return {
    id: goal.id,
    user_id: journalUser.id,
    date: goal.date.toISOString(),
    goal: goal.goal,
  };
}

function makeExpectedProcessVariable(users, process_variable) {
  const journalUser = users.find(
    (user) => user.id === process_variable.user_id
  );

  return {
    id: process_variable.id,
    user_id: journalUser.id,
    date: process_variable.date.toISOString(),
    process_variable: process_variable.process_variable,
  };
}

function makeExpectedHabit(users, habit) {
  const journalUser = users.find((user) => user.id === habit.user_id);

  return {
    id: habit.id,
    user_id: journalUser.id,
    date: habit.date.toISOString(),
    habit: habit.habit,
  };
}

function makeExpectedEntry(users, entry) {
  const journalUser = users.find((user) => user.id === entry.user_id);

  return {
    id: entry.id,
    user_id: journalUser.id,
    date: entry.date.toISOString(),
    type: entry.type,
    variable: entry.variable,
    value: entry.value,
  };
}

// ADD?
function makeMaliciousGoal(user) {
  const maliciousGoal = {
    id: 911,
    user_id: user.id,
    date: new Date(),
    goal: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  };
  console.log(maliciousGoal);
  const expectedGoal = {
    //CHANGE THIS
    // ...makeExpectedGoal([user], makeMaliciousGoal),
    id: maliciousGoal.id,
    user_id: maliciousGoal.id,
    date: maliciousGoal.date,
    goal: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };
  return {
    maliciousGoal,
    expectedGoal,
  };
}

function seedMaliciousGoal(db, user, goal) {
  return db
    .into("users")
    .insert([user])
    .then(() => db.into("goals").insert([goal]));
}

function makeMaliciousHabit(user) {
  const maliciousHabit = {
    id: 911,
    user_id: user.id,
    date: new Date(),
    habit: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  };
  const expectedHabit = {
    id: maliciousHabit.id,
    user_id: maliciousHabit.id,
    date: maliciousHabit.date,
    habit: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };
  return {
    maliciousHabit,
    expectedHabit,
  };
}

function seedMaliciousHabit(db, user, habit) {
  return db
    .into("users")
    .insert([user])
    .then(() => db.into("habits").insert([habit]));
}

module.exports = {
  //raw data creation
  makeUsersArray,
  makeGoalsArray,
  makeHabitsArray,
  makeProcessVariablesArray,
  makeEntriesArray,
  makeJournalFixtures,
  //db setup
  cleanTables,
  seedDbTables,
  seedUsers,
  makeAuthHeader,
  //make expected stuff
  makeExpectedGoal,
  makeExpectedProcessVariable,
  makeExpectedHabit,
  makeExpectedEntry,
  //XSS demo
  makeMaliciousGoal,
  seedMaliciousGoal,
  makeMaliciousHabit,
  seedMaliciousHabit,
};
