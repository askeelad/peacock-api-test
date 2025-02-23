const express = require("express");
const path = require("path");

const app = express();

// Serve static files (CSS, JS, images) from "public" folder
app.use(express.static("public"));
