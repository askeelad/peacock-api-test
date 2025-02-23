let express = require("express");
let router = express.Router();
const User = require("../models/user");
const ContentCategory = require("../models/content");

const { verifyUser } = require("../tools/authenticate");
const { sendSubscriptionEmail } = require("../tools/emailService");

router.post("/subscribe/:id", verifyUser, async (req, res, next) => {
  const isCategoryValid = await ContentCategory.findById(req.params.id);
  if (!isCategoryValid)
    res.status(400).send({ message: "category is not a valid one" });

  const user = await User.findById(req.user._id);
  user.subscribedCategories.push(req.params.id);

  try {
    await user.save();
    // Send confirmation email
    await sendSubscriptionEmail(
      req.user.email,
      req.user.name,
      isCategoryValid.name
    );
  } catch (error) {
    res.status(500).send({ message: "database error" });
  }

  res.status(200).send({ message: "successfully subscribed" });
});

router.post("/unsubscribe/:id", verifyUser, async (req, res, next) => {
  const isCategoryValid = await ContentCategory.findById(req.params.id);
  if (!isCategoryValid)
    res.status(400).send({ message: "category is not a valid one" });

  const user = await User.findById(req.user._id);
  if (!user.subscribedCategories.includes(req.params.id))
    return res.status(400).send({ message: "category is not a valid one" });

  const newSubscribedCategories = user.subscribedCategories.filter(
    (cat) => cat !== req.params.id
  );
  user.subscribedCategories = newSubscribedCategories;
  try {
    await user.save();
  } catch (error) {
    res.status(500).send({ message: "database error" });
  }

  res.status(200).send({ message: "successfully unsubscribed" });
});

module.exports = router;
