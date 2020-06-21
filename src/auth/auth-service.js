const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const xss = require("xss");

const AuthService = {
  getUserWithUserName(db, username) {
    console.log(`This is username inside of getUserWithUsername: ${username}`);
    return db("users").where({ username }).first();
  },
  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },
  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm: "HS256",
    });
  },
  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  },
  parseBasicToken(token) {
    return Buffer.from(token, "base64").toString().split(":");
  },
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

module.exports = AuthService;
