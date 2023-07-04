const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    res.json(database_interaction);
  } catch {
    res.json({ error: "Failed to get user data" });
  }
});

module.exports = router;