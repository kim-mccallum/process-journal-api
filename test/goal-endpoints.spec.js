const knex = require("knex");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
const app = require("../src/app");
const helpers = require("./test-helpers");
const config = require("../src/config");

describe.only("Goal Endpoints", function () {
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

  describe(`GET /api/goal/current`, () => {
    context(`Given no goals`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/goal")
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
        // FIX THIS SO THAT IT GIVES YOU AN EXPECTED GOAL
        it("responds with 200 and the current goal", () => {
          const expectedGoals = testGoals.map((goal) =>
            helpers.makeExpectedGoal(testUsers, goal)
          );
          console.log(expectedGoals);
          // get the goal with the largest date value
          let currentExpectedGoal = [];
          currentExpectedGoal.push(
            expectedGoals.sort((a, b) => {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            })[0]
          );

          return supertest(app)
            .get("/api/goal/current")
            .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
            .expect(200, currentExpectedGoal);
        });
      }
    );
  });

  describe(`POST /api/goal`, () => {
    context(`Given a valid goal`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      it(`creates a goal, responding with 201`, () => {
        const newGoal = {
          user_id: 1,
          date: new Date(),
          goal: "pass the new goal test!",
        };

        return supertest(app)
          .post("/api/goal")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newGoal)
          .expect(201)
          .expect((res) => {
            expect(res.body.goal).to.eql(newGoal.goal);
          });
      });
    });
    //change this to be invalid and malicious goals
    context(`Given an invalid goal`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      it(`response with 400 and a message that the goal is required`, () => {
        const newGoal = {
          user_id: 1,
          date: new Date(),
        };

        return supertest(app)
          .post("/api/goal")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newGoal)
          .expect(400, { error: { message: `goal is required.` } });
      });
    });
    // change this to show that you are actually sanitizing the goal
    context(`Given an XSS attack, it sanitizes the goal`, () => {
      // const testUser = helpers.makeUsersArray()[1];
      console.log("user here:", testUser);
      // make a malicious goal
      const { maliciousGoal, expectedGoal } = helpers.makeMaliciousGoal(
        testUser
      );

      beforeEach("insert malicious goal", () => {
        return helpers.seedMaliciousGoal(db, testUser, maliciousGoal);
      });

      it(`removes XSS attack content`, () => {
        return supertest(app)
          .post("/api/goal")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(expectedGoal)
          .expect(201)
          .expect((res) => {
            expect(res.body.goal).to.eql(expectedGoal.goal);
          });
      });
    });
  });
});
