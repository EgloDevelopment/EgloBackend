const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Servers")
      .findOne({
        channels: {
          $elemMatch: { channel_id: req.body.channel_id },
        },
      });

    res.json(database_interaction);
  } catch (e) {
    console.log(e);
    res.json({ error: "Failed to get server" });
  }
});

module.exports = router;
