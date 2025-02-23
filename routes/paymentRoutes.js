const express = require("express");
const { verifyUser } = require("../tools/authenticate");
const User = require("../models/user");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post("/premium", verifyUser, async (req, res) => {
  try {
    // const customer = await stripe.customers.create({
    //   email: req.user.email,
    //   name: req.user.name,
    // });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      customer_email: req.user.email,
    });

    // as event need to be ceated via checkout to call webhook which is a frontend feature i updated the user model here. Webhook is implemented and works via stripe cli
    const user = await User.findOne({ email: req.user.email });
    if (user) {
      user.isPremium = true;
      await user.save();
    }

    res.json({ sessionId: session.id, message: "payment was successfull" });
  } catch (error) {
    res.status(500).json({ message: "Payment error", error });
  }
});

module.exports = router;
