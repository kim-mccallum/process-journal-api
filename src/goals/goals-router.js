const path = require("path");
const express = require("express");
const xss = require("xss");
const GoalsService = require("./goals-service");
const { requireAuth } = require("../middleware/jwt-auth");

const goalsRouter = express.Router();
const jsonParser = express.json();

// need help sanitizing!
const serializeGoal = (goal) => ({
  user_id: goal.user_id,
  date: xss(goal.date),
  goal: xss(goal.goal),
});

goalsRouter
  .route("/")
  // Maybe create an admin account setting with this priveledge'
  .get(requireAuth, (req, res, next) => {
    GoalsService.getAllGoalsByUserId(req.app.get("db"), req.user.id)
      // Make sure this returns just the most recent goal
      .then((goals) => {
        res.json(goals);
      })
      .catch(next);
  })
  .post([jsonParser, requireAuth], (req, res, next) => {
    console.log(req.body);
    console.log("found user id: ", req.user.id);
    const { date, goal } = req.body;

    // validate - all required fields included?
    if (!req.body["goal"]) {
      return res.status(400).send({
        error: { message: `'goal' is required.` },
      });
    }
    // create new goal object
    let newGoal = {
      user_id: req.user.id,
      date,
      goal,
    };
    // sanitize
    newGoal = serializeGoal(newGoal);
    //call create method
    GoalsService.createGoal(req.app.get("db"), newGoal)
      .then((goal) => {
        //   Don't think I need this location
        res.status(201).location(`/goals/${goal.user_id}`).json(goal);
      })
      .catch(next);
  });

// Get just the current (i.e., most recent)
goalsRouter
  .route("/current")
  // Maybe create an admin account setting with this priveledge'
  .get(requireAuth, (req, res, next) => {
    GoalsService.getCurrentByUserId(req.app.get("db"), req.user.id)
      // Make sure this returns just the most recent goal
      .then((goal) => {
        let recentGoal = goal.rows;
        // console.log(recentGoal);
        res.json(recentGoal);
      })
      .catch(next);
  });

module.exports = goalsRouter;
