const passport = require("passport");
const jwt = require("jsonwebtoken");

exports.COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: "none",
  signed: true,
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
};

exports.getToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: eval(process.env.JWT_EXPIRY),
  });
};

exports.getRefreshToken = (user) => {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY),
  });
  return refreshToken;
};

exports.verifyUser = function authenticateJwt(req, res, next) {
  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send("An error occured while user authentication.");
    }
    if (!user) {
      // console.log("Token Expired!")
      return res
        .status(401)
        .json({ message: "Invalid or expired access token" });
    }
    req.user = user;
    next();
  })(req, res, next);
};

exports.checkPremium = async (req, res, next) => {
  if (!req.user.isPremium) {
    return res.status(403).json({ message: "Premium content access required" });
  }
  next();
};
