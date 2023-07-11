const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Servers")
      .findOne({ id: req.body.server_id });

    res.json(database_interaction.channels);
  } catch (e) {
    console.log(e);
    res.json({ error: "Failed to get user data" });
  }
});

module.exports = router;
