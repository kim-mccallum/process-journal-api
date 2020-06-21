const path = require("path");
const express = require("express");
const xss = require("xss");
const EntriesService = require("./entries-service");
const { requireAuth } = require("../middleware/jwt-auth");

const entriesRouter = express.Router();
const jsonParser = express.json();

// need help sanitizing!
const serializeEntry = (entry) => ({
  user_id: entry.user_id,
  date: xss(entry.date),
  type: xss(entry.type),
  variable: xss(entry.variable),
  value: xss(entry.value),
});

entriesRouter
  .route("/")
  // Make this queryable by date
  .get(requireAuth, (req, res, next) => {
    console.log(req.query);
    EntriesService.getByUserId(req.app.get("db"), req.user.id, req.query)
      .then((entries) => {
        res.json(entries);
      })
      .catch(next);
  })
  // handle duplicate potential on the front end
  .post([jsonParser, requireAuth], (req, res, next) => {
    console.log(req.body);
    console.log("found user id: ", req.user.id);
    const { date, type, variable, value } = req.body;

    // validate - all required fields included?
    for (const field of ["type", "variable", "value"]) {
      if (!req.body[field]) {
        return res.status(400).send({
          error: { message: `'${field}' is required.` },
        });
      }
    }
    // create new entry object
    let newEntry = {
      user_id: req.user.id,
      date,
      type,
      variable,
      value,
    };
    // sanitize
    newEntry = serializeEntry(newEntry);
    //call create method
    EntriesService.createEntry(req.app.get("db"), newEntry)
      .then((entry) => {
        res.status(201).location(`/entries/${entry.user_id}`).json(entry);
      })
      .catch(next);
  });

module.exports = entriesRouter;
