const bcrypt = require("bcryptjs");
const xss = require("xss");

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  hasUserWithUserName(db, username) {
    return db("users")
      .where({ username })
      .first()
      .then((user) => !!user);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into("users")
      .returning("*")
      .then(([user]) => user);
  },
  validatePassword(password) {
    if (password.length < 6) {
      return "Password be longer than 6 characters";
    }
    // //TURN THESE BACK ON LATER BUT THEY ARE ANNOYING DURING DEVELOPMENT
    // if (password.length > 72) {
    //   return "Password be less than 72 characters";
    // }
    // if (password.startsWith(" ") || password.endsWith(" ")) {
    //   return "Password must not start or end with empty spaces";
    // }
    // if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
    //   return "Password must contain one upper case, lower case, number and special character";
    // }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeUser(user) {
    return {
      id: user.id,
      username: xss(user.username),
      email: xss(user.email),
    };
  },
};

module.exports = UsersService;
