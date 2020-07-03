const app = require("../src/app");

describe("Basic server test.", () => {
  it('GET / responds with 200 containing "Hello, Process Journal App!"', () => {
    return supertest(app).get("/").expect(200, "Hello, Process Journal App!");
  });
});
