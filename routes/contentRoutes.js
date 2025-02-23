let express = require("express");
let router = express.Router();
const User = require("../models/user");
const ContentCategory = require("../models/content");

const { verifyUser, checkPremium } = require("../tools/authenticate");

const { EXTERNAL_API_URL } = process.env;

router.get("/populateCategory", verifyUser, async (req, res, next) => {
  const resData = await fetch(
    "https://dummyjson.com/products/categories?sortBy=name&order=asc"
  );
  const categories = await resData.json();

  categories.map(async (category) => {
    const sampleDataRes = await fetch(
      `${category.url}?sortBy=stock,rating&order=desc&limit=5&select=id'`
    );

    const sampleData = await sampleDataRes.json();

    let Content = new ContentCategory({
      name: category.name,
      sampleArticles: sampleData?.products,
    });

    await Content.save();
  });

  res.status(200).send({ message: "Categories with samples populated" });
});

router.get("/feed", verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "subscribedCategories"
    );
    const fetchData = async () => {
      try {
        let content = []; // Initialize empty content array

        // Fetch all categories in parallel
        const promises = user.subscribedCategories.map(async (cat) => {
          const resData = await fetch(
            `https://dummyjson.com/products/category/${cat.name}?sortBy=stock,rating&order=desc`
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

        res.status(200).json({ content });
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    };

    // Call the function
    fetchData();
  } catch (error) {
    res.status(500).json({ message: "Error fetching content", error });
  }
});

router.get(
  "/premiumContent",
  verifyUser,
  checkPremium,
  async (req, res, next) => {
    const resData = await fetch(
      "https://newsapi.org/v2/everything?q=bitcoin&apiKey=77c62c5071fa4f538f044ffb53bd3267"
    );
    const content = await resData.json();

    res.status(200).json({ content });
  }
);
module.exports = router;
