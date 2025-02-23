const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const authRoutes = require("../routes/authRoutes");
const subscriptionRoutes = require("../routes/subscriptionRoutes");
const contentRoutes = require("../routes/contentRoutes");
const paymentRoutes = require("../routes/paymentRoutes");
const webhookRoutes = require("../routes/webhook");

dotenv.config();

const app = express();

app.use("/webhook", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.static("public"));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/content", contentRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

module.exports = app;
