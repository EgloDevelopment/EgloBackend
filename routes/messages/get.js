const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

router.post("/", async (req, res) => {
  try {
    const client = get();

    let users = [];
    let messages = [];

    messages = await client
      .db("EgloCloud")
      .collection("Messages")
      .find({ channel_id: req.body.channel_id })
      .limit(parseInt(req.query.limit))
      .toArray();

    const unique_sender_ids = [...new Set(messages.map((item) => item.sender_id))];

    for (const val of unique_sender_ids) {
      let users_results = await client
        .db("EgloCloud")
        .collection("Users")
        .findOne({ id: val });

      users.push({ username: users_results.username, id: val });
    }

    for (const message of messages) {
      const user = users.find((user) => user.id === message.sender_id);
      if (user) {
        message.sender_name = user.username;
      }
    }

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.json({ error: "Failed to get messages" });
  }
});

module.exports = router;
