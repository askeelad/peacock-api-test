const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const authRoutes = require("../routes/authRoutes");
const subscriptionRoutes = require("../routes/subscriptionRoutes");
const contentRoutes = require("../routes/contentRoutes");
// const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("../routes/paymentRoutes");
const webhookRoutes = require("../routes/webhook");
const User = require("../models/user");
let cron = require("node-cron");
const { sendRecommendationEmail } = require("../tools/recommendationEmail");

dotenv.config();

const app = express();

app.use("/webhook", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

/* Reoccuring task: checks renderjobs for jobPostStatus "queued" and request GraphExecution Pipeline State */
/* if 100%, fetch images and send email */

// Initialize a lock flag
let isRunning = false;
//Running task every Sunday at midnight (00:00)
cron.schedule("0 0 * * 0", async () => {
  if (isRunning) {
    // console.log("Job is already running, skipping this execution...");
    return; // Prevent the job from running again if it is already running
  }

  try {
    // Set the lock flag to true
    isRunning = true;
    // console.log("Job started...");

    // Simulated job logic
    await sendWeeklyRecommendation();
  } catch (error) {
    console.error("Error occurred during job execution:", error);
  } finally {
    // Release the lock flag
    isRunning = false;
    // console.log("Job finished.");
  }
});

const sendWeeklyRecommendation = async () => {
  const users = await User.find().populate("subscribedCategories");
  const sendEmail = async (user) => {
    try {
      let content = []; // Initialize empty content array

      // Fetch all categories in parallel
      const promises = user.subscribedCategories.map(async (cat) => {
        const resData = await fetch(
          `https://dummyjson.com/products/category/${cat.name}?sortBy=stock,rating&order=desc&limit=5`
        );

        if (!resData.ok) throw new Error(`API Error: ${resData.status}`);

        const contentByCat = await resData.json();
        return contentByCat.products || []; // Return empty array if no products
      });

      // Wait for all fetch requests to complete
      const results = await Promise.allSettled(promises);

      // Extract successful results only
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          content = [...content, ...result.value]; // Append results
        } else {
          console.error("Fetch failed:", result.reason);
        }
      });

      // get latest from most popular ones
      content = content.sort((a, b) => {
        b.meta.createdAt - a.meta.createdAt;
      });
      if (content.length > 5) content = content.slice(1, 5);
      sendRecommendationEmail(user.email, user.name, content);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  users.forEach((user) => {
    sendEmail(user);
  });
};

module.exports = app;
