const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

router.post("/", async (req, res) => {
  try {
    const client = get();
  } catch (error) {
    console.log(error);
    res.json({ error: "Failed to get" });
  }
});

module.exports = router;
