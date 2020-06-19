const path = require("path");
const express = require("express");
const xss = require("xss");
const EntriesService = require("./entries-service");
// const auth = require("../middleware/auth");
const { requireAuth } = require("../middleware/jwt-auth");

const entriesRouter = express.Router();
const jsonParser = express.json();

// need help sanitizing!
const serializeEntry = (entry) => ({
  user_id: entry.user_id,
  journal_id: xss(entry.journal_id),
  date: xss(entry.date),
  target_value: xss(entry.target_value),
  habit_value: xss(entry.habit_value),
});

entriesRouter
  .route("/")
  // Maybe create an admin account setting with this priveledge'
  .get(requireAuth, (req, res, next) => {
    EntriesService.getByUserId(req.app.get("db"), req.user.id)
      .then((entries) => {
        res.json(entries);
      })
      // should this be next or something else?
      .catch(next);
  })
  // handle duplicate potential on the front end
  .post([jsonParser, requireAuth], (req, res, next) => {
    console.log(req.body);
    console.log("found user id: ", req.user.id);
    const { journal_id, date, target_value, habit_value } = req.body;

    // validate - all required fields included?
    for (const field of ["journal_id", "target_value", "habit_value"]) {
      if (!req.body[field]) {
        return res.status(400).send({
          error: { message: `'${field}' is required.` },
        });
      }
    }
    // create new entry object
    // SOMEHOW USE THE USERNAME FROM THE TOKEN TO GET THE USERID
    let newEntry = {
      user_id: req.user.id,
      journal_id,
      // // add optional date either get it from request or set default now()
      date,
      target_value,
      habit_value,
    };

    newEntry = serializeEntry(newEntry);
    //call create method
    EntriesService.createEntry(req.app.get("db"), newEntry)
      .then((entry) => {
        res
          .status(201)
          .location(`/entries/${entry.user_id}`)
          // add the serialize function here to sanitize post!?
          .json(entry);
      })
      .catch(next);
  });

// not using this route
entriesRouter
  .route(`/:user_id`)
  .all(requireAuth, (req, res, next) => {
    console.log(req.user.id, req.params.user_id);
    if (req.params.user_id != req.user.id) {
      return res.status(401).json({
        error: {
          message: `Unauthorized. Users can only access their own account data.`,
        },
      });
    }
    EntriesService.getByUserId(req.app.get("db"), req.params.user_id)
      .then((entries) => {
        if (entries.length === 0) {
          return res.status(404).json({
            error: { message: `user doesn't exist` },
          });
        }
        next();
      })
      .catch();
  })
  .get((req, res, next) => {
    EntriesService.getByUserId(req.app.get("db"), req.params.user_id)
      .then((entries) => {
        res.json(entries);
      })
      // should this be next or something else?
      .catch(next);
  });

module.exports = entriesRouter;
