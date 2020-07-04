const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");
const config = require("../src/config");

describe("Protected endpoints", function () {
  let db;

  const {
    testUsers,
    testGoals,
    testProcessVariables,
    testHabits,
    testEntries,
  } = helpers.makeJournalFixtures();
  // make fixtures works!

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: config.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  // // Delete db content
  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  beforeEach("insert locations", () =>
    helpers.seedDbTables(
      db,
      testUsers,
      testGoals,
      testProcessVariables,
      testHabits,
      testEntries
    )
  );

  // Set up all the endpoints testing
  const protectedEndpoints = [
    {
      name: "GET /api/goal/current",
      path: "/api/goal/current",
      method: supertest(app).get,
    },
    {
      name: "GET /api/process_variable/current",
      path: "/api/process_variable/current",
      method: supertest(app).get,
    },
    {
      name: "GET /api/habit/current",
      path: "/api/habit/current",
      method: supertest(app).get,
    },
    {
      name: "GET /api/entries",
      path: "/api/entries",
      method: supertest(app).get,
    },
    {
      name: "POST /api/goal",
      path: "/api/goal",
      method: supertest(app).post,
    },
    {
      name: "POST /api/process_variable",
      path: "/api/process_variable",
      method: supertest(app).post,
    },
    {
      name: "POST /api/habit",
      path: "/api/habit",
      method: supertest(app).post,
    },
    {
      name: "POST /api/entries",
      path: "/api/entries",
      method: supertest(app).post,
    },
  ];

  protectedEndpoints.forEach((endpoint) => {
    describe(endpoint.name, () => {
      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint
          .method(endpoint.path)
          .expect(401, { error: `Missing bearer token` });
      });
      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0];
        const invalidSecret = "bad-secret";
        return endpoint
          .method(endpoint.path)
          .set(
            "Authorization",
            helpers.makeAuthHeader(validUser, invalidSecret)
          )
          .expect(401, { error: `Unauthorized request` });
      });
      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: "user-not-existy", id: 1 };
        return endpoint
          .method(endpoint.path)
          .set("Authorization", helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: `Unauthorized request` });
      });
    });
  });
});
