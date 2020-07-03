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
    // {
    //   id: 2,
    //   user_id: users[1].id,
    //   date: new Date("2029-01-22T16:28:32.615Z"),
    //   goal: "Natus consequuntur deserunt commodi.",
    // },
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
    // {
    //   id: 2,
    //   user_id: users[1].id,
    //   date: new Date("2029-01-22T16:28:32.615Z"),
    //   habit: "Natus consequuntur deserunt commodi.",
    // },
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
    // {
    //   id: 2,
    //   user_id: users[1].id,
    //   date: new Date("2029-01-22T16:28:32.615Z"),
    //   habit: "Natus consequuntur deserunt commodi.",
    // },
  ];
}

//COME BACK AND MAKE HABIT AND PROCESS-VARIABLES ARRAY
function makeEntriesArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      date: new Date("2029-01-22T16:28:32.615Z"),
      type: "variable",
      variable: "First entry",
      value: 1,
    },
    {
      id: 2,
      user_id: users[0].id,
      date: new Date("2030-01-22T16:28:32.615Z"),
      type: "variable",
      variable: "Second entry",
      value: 2,
    },
    // {
    //   id: 2,
    //   user_id: users[1].id,
    //   date: new Date("2029-01-22T16:28:32.615Z"),
    //   type: "habit",
    //   variable: "Natus consequuntur deserunt commodi.",
    //   value: 10,
    // },
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
    user_id: journalUser,
    date: goal.date.toISOString(),
    goal: goal.goal,
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
  const expectedGoal = {
    //CHANGE THIS
    ...makeExpectedGoal([user], makeMaliciousGoal),
    goal: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  };
  return {
    maliciousGoal,
    expectedGoal,
  };
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

  //   makeExpectedGoal,
  // makeMaliciousGoal
};
