const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const { v4: uuidv4 } = require("uuid")

router.post("/", async (req, res) => {
  try {
    const client = get();

    const user = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    const server = await client
      .db("EgloCloud")
      .collection("Servers")
      .findOne({ id: req.body.server_id });

    if (user.id !== server.server_owner) {
      res.json({ error: "Unauthorized" });
      return;
    }

    await client
      .db("EgloCloud")
      .collection("Servers")
      .updateOne(
        { id: req.body.server_id },
        {
          $push: {
            channels: { name: req.body.channel_name, channel_id: uuidv4() }
          },
        }
      );

    res.json({success: true});
  } catch (error) {
    res.json({ error: "Failed to create channel" });
  }
});

module.exports = router;
