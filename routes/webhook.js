const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/user");

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("entering webhook");
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log(session);
        const customerEmail = session.customer_email;
        // console.log("customerEmail");
        // console.log(customerEmail);
        // const fullSession = await stripe.checkout.sessions.retrieve(session.id);

        // console.log("✅ Full Session Data:", fullSession);

        try {
          const user = await User.findOne({ email: customerEmail });
          if (user) {
            user.isPremium = true;
            await user.save();
            console.log(`✅ User ${customerEmail} upgraded to premium.`);
          }
        } catch (error) {
          console.error("❌ Error updating user:", error);
          return res.status(500).send("Server error");
        }
        break;
      }

      case "payment_intent.succeeded": {
        console.log(`your payment was successfull.`);
      }

      case "payment_intent.payment_failed": {
        console.log(`your payment was successfull.`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send("Webhook received");
  }
);

module.exports = router;
