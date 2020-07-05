const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");
const config = require("../src/config");

describe.only("Process Variable Endpoints", function () {
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

  describe(`GET /api/process_variable/current`, () => {
    context(`Given no process_variable`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/process_variable")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });
    context(
      `Given there are variables in the database, it returns the 'current'`,
      () => {
        beforeEach("insert data", () =>
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
        it("responds with 200 and the current process_variable", () => {
          const expectedVariables = testProcessVariables.map(
            (process_variable) =>
              helpers.makeExpectedProcessVariable(testUsers, process_variable)
          );
          console.log(expectedVariables);
          // get the process_variable with the largest date value
          let currentExpectedVariable = [];
          currentExpectedVariable.push(
            expectedVariables.sort((a, b) => {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            })[0]
          );

          return supertest(app)
            .get("/api/process_variable/current")
            .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
            .expect(200, currentExpectedVariable);
        });
      }
    );
  });

  describe(`POST /api/process_variable`, () => {
    context(`Given a valid process_variable`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      it(`creates a process_variable, responding with 201`, () => {
        const newVariable = {
          user_id: 1,
          date: new Date(),
          process_variable: "pass the new process_variable test!",
        };

        return supertest(app)
          .post("/api/process_variable")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newVariable)
          .expect(201)
          .expect((res) => {
            expect(res.body.process_variable).to.eql(
              newVariable.process_variable
            );
          });
      });
    });
    //change this to be invalid and malicious goals
    context(`Given an invalid process_variable`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      it(`response with 400 and a message that the process_variable is required`, () => {
        const newVariable = {
          user_id: 1,
          date: new Date(),
        };

        return supertest(app)
          .post("/api/process_variable")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newVariable)
          .expect(400, {
            error: { message: `'process_variable' is required.` },
          });
      });
    });
  });
});
