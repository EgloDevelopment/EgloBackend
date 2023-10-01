const express = require("express");
const router = express.Router();
const { get } = require("../databases/mongodb");

require("dotenv").config();

router.get("/", (req, res) => {
  res.send("EgloBackend");
});

module.exports = router;