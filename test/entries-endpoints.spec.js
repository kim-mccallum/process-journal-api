const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");
const config = require("../src/config");

describe("Entries Endpoints", function () {
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

  describe(`GET /api/entries`, () => {
    context(`Given no entries`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/entries")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });
    context(
      `Given there are entries in the database, it returns the full array`,
      () => {
        beforeEach("insert entries", () =>
          helpers.seedDbTables(
            db,
            testUsers,
            testGoals,
            testProcessVariables,
            testHabits,
            testEntries
          )
        );

        it("responds with 200 and an array of entries", () => {
          const expectedEntries = testEntries.map((entry) =>
            helpers.makeExpectedEntry(testUsers, entry)
          );
          console.log(expectedEntries);

          return supertest(app)
            .get("/api/entries")
            .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
            .expect(200, expectedEntries);
        });
      }
    );
  });

  describe(`POST /api/entries`, () => {
    context(`Given a valid entry`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      it(`creates an entry, responding with 201`, () => {
        const newEntry = {
          user_id: 1,
          date: new Date(),
          type: "habit",
          variable: "an entry test example",
          value: "0",
        };

        return supertest(app)
          .post("/api/entries")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newEntry)
          .expect(201)
          .expect((res) => {
            expect(res.body.variable).to.eql(newEntry.variable);
          });
      });
    });
    //change this to be invalid and malicious goals
    context(`Given an invalid entry`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      it(`response with 400 and a message that the variable is required`, () => {
        const newEntry = {
          user_id: 1,
          date: new Date(),
          type: "habit",
          value: "0",
        };

        return supertest(app)
          .post("/api/entries")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newEntry)
          .expect(400, { error: { message: `'variable' is required.` } });
      });
    });
  });
});
