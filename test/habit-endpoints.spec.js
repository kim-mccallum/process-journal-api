const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");
const config = require("../src/config");

describe("Habit Endpoints", function () {
  let db;

  const {
    testUsers,
    testGoals,
    testProcessVariables,
    testHabits,
    testEntries,
  } = helpers.makeJournalFixtures();
  const testUser = testUsers[0];

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: config.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe(`GET /api/habit/current`, () => {
    context(`Given no habits`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/habit")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });
    context(
      `Given there are goals in the database, it returns the 'current'`,
      () => {
        beforeEach("insert goals", () =>
          helpers.seedDbTables(
            db,
            testUsers,
            testGoals,
            testProcessVariables,
            testHabits,
            testEntries
          )
        );
        // FIX THIS SO THAT IT GIVES YOU AN EXPECTED HABIT
        it("responds with 200 and the current habit", () => {
          const expectedHabits = testHabits.map((habit) =>
            helpers.makeExpectedHabit(testUsers, habit)
          );
          console.log(expectedHabits);
          // get the habit with the largest date value
          let currentExpectedHabit = [];
          currentExpectedHabit.push(
            expectedHabits.sort((a, b) => {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            })[0]
          );

          return supertest(app)
            .get("/api/habit/current")
            .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
            .expect(200, currentExpectedHabit);
        });
      }
    );
  });

  describe(`POST /api/habit`, () => {
    context(`Given a valid habit`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      it(`creates a habit, responding with 201`, () => {
        const newHabit = {
          user_id: 1,
          date: new Date(),
          habit: "pass the new habit test!",
        };

        return supertest(app)
          .post("/api/habit")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newHabit)
          .expect(201)
          .expect((res) => {
            expect(res.body.habit).to.eql(newHabit.habit);
          });
      });
    });
    //change this to be invalid and malicious goals
    context(`Given an invalid habit`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      it(`response with 400 and a message that the habit is required`, () => {
        const newHabit = {
          user_id: 1,
          date: new Date(),
        };

        return supertest(app)
          .post("/api/habit")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newHabit)
          .expect(400, { error: { message: `'habit' is required.` } });
      });
    });
    // change this to show that you are actually sanitizing the habit
    context(`Given an XSS attack, it sanitizes the habit`, () => {
      // const testUser = helpers.makeUsersArray()[1];
      console.log("user here:", testUser);
      // make a malicious habit
      const { maliciousHabit, expectedHabit } = helpers.makeMaliciousHabit(
        testUser
      );

      beforeEach("insert malicious habit", () => {
        return helpers.seedMaliciousHabit(db, testUser, maliciousHabit);
      });

      it(`removes XSS attack content`, () => {
        return supertest(app)
          .post("/api/habit")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(expectedHabit)
          .expect(201)
          .expect((res) => {
            expect(res.body.habit).to.eql(expectedHabit.habit);
          });
      });
    });
  });
});
