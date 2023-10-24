const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const { v4: uuidv4 } = require("uuid");
const {
  getUserIDFromToken,
} = require("../../functions/get-user-id-from-token");
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
      {
        content: {
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

    const message_id = uuidv4();
    const sent_time = Date.now();

    const user = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ id: await getUserIDFromToken(req.cookies.token) });

    await client.db("EgloCloud").collection("Messages").insertOne({
      channel_id: req.body.channel_id,
      message_id: message_id,
      sender_id: user.id,
      content: req.body.content.trim(),
      time: sent_time,
    });

    res
      .status(200)
      .send({ sent: true, time: sent_time, message_id: message_id });
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
