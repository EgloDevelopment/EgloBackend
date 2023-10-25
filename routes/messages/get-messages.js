const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const { validateBody } = require("../../functions/validate-body.js");

router.post("/", async (req, res) => {
  try {
    const errors = await validateBody(req.body, [
      {
        channel_id: {
          type: "string",
          empty: false,
          email: false,
          max_length: 0,
          alphanumeric: false,
          strong_password: false,
        },
      },
    ]);

    if (errors) {
      res.status(401).json(errors);
      return;
    }

    const client = get();

    let users = [];
    let messages = [];

    messages = await client
      .db("EgloCloud")
      .collection("Messages")
      .find({ channel_id: req.body.channel_id })
      .sort({ _id: -1 })
      .limit(parseInt(req.query.limit))
      .toArray();

    const unique_sender_ids = [
      ...new Set(messages.map((item) => item.sender_id)),
    ];

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

    res.status(200).send(messages.reverse());
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: true,
      fields: ["*"],
      data: "Internal server error",
    });
    return;
  }
});

module.exports = router;
