const path = require("path");
const express = require("express");
const xss = require("xss");
const HabitsService = require("./habits-service");
const { requireAuth } = require("../middleware/jwt-auth");

const habitsRouter = express.Router();
const jsonParser = express.json();

// need help sanitizing!
const serializeHabit = (habit) => ({
  user_id: habit.user_id,
  date: xss(habit.date),
  habit: xss(habit.habit),
});

habitsRouter
  .route("/")
  // Maybe create an admin account setting with this priveledge'
  .get(requireAuth, (req, res, next) => {
    HabitsService.getAllHabitsByUserId(req.app.get("db"), req.user.id)
      // Make sure this returns just the most recent habit
      .then((habits) => {
        res.json(habits);
      })
      .catch(next);
  })
  .post([jsonParser, requireAuth], (req, res, next) => {
    console.log(req.body);
    console.log("found user id: ", req.user.id);
    const { date, habit } = req.body;

    // validate - all required fields included?
    if (!req.body["habit"]) {
      return res.status(400).send({
        error: { message: `'habit' is required.` },
      });
    }
    // create new habit object
    let newHabit = {
      user_id: req.user.id,
      date,
      habit,
    };
    // sanitize
    newHabit = serializeHabit(newHabit);
    //call create method
    HabitsService.createHabit(req.app.get("db"), newHabit)
      .then((habit) => {
        //   Don't think I need this location
        res.status(201).location(`/goals/${habit.user_id}`).json(habit);
      })
      .catch(next);
  });

// Get just the current (i.e., most recent)
habitsRouter
  .route("/current")
  // Maybe create an admin account setting with this priveledge'
  .get(requireAuth, (req, res, next) => {
    HabitsService.getCurrentHabitByUserId(req.app.get("db"), req.user.id)
      // Make sure this returns just the most recent habit
      .then((habit) => {
        let recentHabit = habit.rows;
        // console.log(recentGoal);
        res.json(recentHabit);
      })
      .catch(next);
  });

module.exports = habitsRouter;
