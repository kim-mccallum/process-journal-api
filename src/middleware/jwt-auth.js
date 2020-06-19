const AuthService = require("../auth/auth-service");

function requireAuth(req, res, next) {
  console.log("we are in jwt auth!");
  const authToken = req.get("Authorization") || "";

  let bearerToken;
  if (!authToken.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  } else {
    //   second parameter isn't requires
    bearerToken = authToken.slice(7, authToken.length);
  }
  try {
    const payload = AuthService.verifyJwt(bearerToken);

    AuthService.getUserWithUserName(req.app.get("db"), payload.sub)
      .then((user) => {
        if (!user) {
          console.log("dont have user");
          return res.status(401).json({ error: "Unauthorized request" });
        }
        console.log("verified JWT and found user:", user);
        req.user = user;
        next();
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  } catch (error) {
    console.log("some other error?");
    res.status(401).json({ error: "Unauthorized request" });
  }
}

module.exports = {
  requireAuth,
};
