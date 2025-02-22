let express = require("express");
let router = express.Router();
const User = require("../models/user");
const ContentCategory = require("../models/content");

const { verifyUser } = require("../tools/authenticate");

const { EXTERNAL_API_URL } = process.env;

router.get("/populateCategory", async (req, res, next) => {
  const resData = await fetch(
    "https://dummyjson.com/products/categories?sortBy=name&order=asc"
  );
  const categories = await resData.json();

  categories.map(async (category) => {
    const sampleDataRes = await fetch(
      `${category.url}?sortBy=stock,rating&order=desc&limit=5&select=id'`
    );

    const sampleData = await sampleDataRes.json();
    console.log(category.name);
    console.log(sampleData);
    let Content = new ContentCategory({
      name: category.name,
      sampleArticles: sampleData?.products,
    });

    await Content.save();
  });

  res.status(200).send({ message: "Categories with samples populated" });
});

module.exports = router;
