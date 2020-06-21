const path = require("path");
const express = require("express");
const xss = require("xss");
const ProcessVariablesService = require("./process-variables-service");
const { requireAuth } = require("../middleware/jwt-auth");

const processVariablesRouter = express.Router();
const jsonParser = express.json();

// need help sanitizing!
const serializeVariable = (variable) => ({
  user_id: variable.user_id,
  date: xss(variable.date),
  process_variable: xss(variable.process_variable),
});

processVariablesRouter
  .route("/")
  // Get all their variables'
  .get(requireAuth, (req, res, next) => {
    ProcessVariablesService.getAllByUserId(req.app.get("db"), req.user.id)
      // Make sure this returns just the most recent goal
      .then((variables) => {
        res.json(variables);
      })
      .catch(next);
  })
  //   Create a new variable
  .post([jsonParser, requireAuth], (req, res, next) => {
    console.log(req.body);
    console.log("found user id: ", req.user.id);
    const { date, process_variable } = req.body;

    // validate - all required fields included?
    if (!req.body["process_variable"]) {
      return res.status(400).send({
        error: { message: `'process_variable' is required.` },
      });
    }
    // create new goal object
    let newVariable = {
      user_id: req.user.id,
      date,
      process_variable,
    };
    // sanitize
    newVariable = serializeVariable(newVariable);
    //call create method
    ProcessVariablesService.createVariable(req.app.get("db"), newVariable)
      .then((variable) => {
        //   Don't think I need this location
        res
          .status(201)
          .location(`/process-variables/${variable.user_id}`)
          .json(variable);
      })
      .catch(next);
  });

// Get just the current (i.e., most recent)
processVariablesRouter
  .route("/current")
  // Maybe create an admin account setting with this priveledge'
  .get(requireAuth, (req, res, next) => {
    ProcessVariablesService.getCurrentByUserId(req.app.get("db"), req.user.id)
      // Make sure this returns just the most recent goal
      .then((variable) => {
        let recentVariable = variable.rows;
        // console.log(recentVariable);
        res.json(recentVariable);
      })
      .catch(next);
  });

module.exports = processVariablesRouter;
