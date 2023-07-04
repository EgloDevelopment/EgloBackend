const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const validator = require("validator");
const { v4: uuidv4 } = require("uuid");

router.post("/", async (req, res) => {
  try {
    if (
      validator.isEmpty(req.body.content.trim()) === true ||
      validator.isEmpty(req.body.channel_id) === true ||
      validator.isEmpty(req.cookies.token)
    ) {
      res.json({ error: "Message is invalid" });
      return;
    }

    const client = get();

    const token = uuidv4();
    const user = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });
    if (user.id === req.cookies.id) {
      await client.db("EgloCloud").collection("Messages").insertOne({
        channel_id: req.body.channel_id,
        message_id: token,
        sender_id: user.id,
        content: req.body.content.trim(),
        time: Date.now(),
      });
    }
    res.json({ status: true });
  } catch (e) {
    console.log(e)
    res.json({ error: "Failed to send message" });
  }
});

module.exports = router;
