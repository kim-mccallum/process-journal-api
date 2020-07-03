// process.env.TZ = "UCT";
// process.env.NODE_ENV = "test";

// require("dotenv").config();

// process.env.TEST_DATABASE_URL =
//   process.env.TEST_DATABASE_URL ||
//   "postgresql://postgres@localhost/process-journal-test";

const { expect } = require("chai");
const supertest = require("supertest");

global.expect = expect;
global.supertest = supertest;
