let express = require("express");
let router = express.Router();
let crypto = require("crypto");
const jwt = require("jsonwebtoken");
let passport = require("passport");
let LocalStrategy = require("passport-local");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const {
  getToken,
  COOKIE_OPTIONS,
  getRefreshToken,
  verifyUser,
} = require("../tools/authenticate");

const User = require("../models/user");

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    const user = await User.findOne({ email: username });
    if (!user) {
      return cb(null, false, { message: "Incorrect username or password." });
    }

    crypto.pbkdf2(
      password,
      user.salt,
      310000,
      32,
      "sha256",
      function (err, hashedPassword) {
        if (err) {
          return cb(err);
        }

        if (
          !crypto.timingSafeEqual(
            Buffer.from(user.password),
            Buffer.from(hashedPassword)
          )
        ) {
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }

        return cb(null, user);
      }
    );
  })
);

// use passport jwt strategy
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findById(jwt_payload._id);

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, {
      id: user._id,
      username: user.name,
      email: user.email,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

router.post(
  "/passport",
  passport.authenticate("local", { session: false }),
  (req, res, next) => {
    const token = getToken({ _id: req.user._id });
    const refreshToken = getRefreshToken({ _id: req.user._id });
    User.findById(req.user._id)
      .populate("subscribedCategories")
      .then(
        (user) => {
          res.status(200).json({
            access_token: token,
            refresh_token: refreshToken,
            user: { _id: user._id },
          });
        },
        (err) => next(err)
      );
  }
);

router.get("/refreshtoken", (req, res) => {
  let refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken();
  refreshToken = refreshToken(req);

  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token provided" });
  }

  // Verify the refresh token
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        // console.log(err);
        return res
          .status(401)
          .json({ message: "Invalid or expired refresh token" });
      }

      // Find the user associated with the refresh token
      const user = await User.findById(decoded._id);
      if (err || !user) {
        return res.status(404).json({ message: "User not found" });
      }

      const token = getToken({ _id: decoded._id });
      const refreshToken = getRefreshToken({ _id: decoded._id });

      return res.status(200).json({
        access_token: token,
        refresh_token: refreshToken,
      });
    }
  );
});

router.post("/signup", (req, res, next) => {
  let salt = crypto.randomBytes(16);
  crypto.pbkdf2(
    req.body.password,
    salt,
    310000,
    32,
    "sha256",
    async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }
      let user = new User({
        name: req.body.name,
        password: hashedPassword,
        salt: salt,
        email: req.body.email,
      });
      const token = getToken({ _id: user._id });
      const refreshToken = getRefreshToken({ _id: user._id });

      const result = await user.save();
      res.status(200).send({ token, refreshToken });
    }
  );
});

module.exports = router;
