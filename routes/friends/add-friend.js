const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const { v4: uuidv4 } = require("uuid");

const { pushNotification } = require("../../functions/push-notification.js");

const { validateBody } = require("../../functions/validate-body.js");

const {
  getUserIDFromToken,
} = require("../../functions/get-user-id-from-token");

router.post("/", async (req, res) => {
  try {
    const errors = await validateBody(req.body, [
      {
        username: {
          type: "string",
          empty: false,
          email: false,
          max_length: 0,
          alphanumeric: true,
          strong_password: false,
        },
      },
    ]);

    if (errors) {
      res.status(401).json(errors);
      return;
    }

    const client = get();

    let user_receiving_friend_request = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ username: req.body.username.toLowerCase() });

    let user_sending_friend_request = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ id: await getUserIDFromToken(req.cookies.token) });

    if (user_receiving_friend_request === null) {
      res.status(403).send({
        error: true,
        fields: ["username"],
        data: "User does not exist",
      });
      return;
    }

    if (user_receiving_friend_request.id === user_sending_friend_request.id) {
      res.status(403).send({
        error: true,
        fields: ["username"],
        data: "You can not add yourself",
      });
      return;
    }

    let check_friend_if_added = await client
      .db("EgloCloud")
      .collection("Friends")
      .findOne({
        users: {
          $all: [user_sending_friend_request.id, user_receiving_friend_request.id],
        },
      });

    if (check_friend_if_added !== null) {
      res.status(403).send({
        error: true,
        fields: ["username"],
        data: "You already have this person added",
      });
      return;
    }

    let id = uuidv4();
    let channel_id = uuidv4();

    await client
      .db("EgloCloud")
      .collection("Friends")
      .insertOne({
        users: [
          user_sending_friend_request.id,
          user_receiving_friend_request.id,
        ],
        id: id,
        channel_id: channel_id,
      });

    pushNotification(
      [user_receiving_friend_request.ens_subscriber_id],
      "",
      "New friend",
      user_sending_friend_request.username + " added you as a friend"
    );

    res.status(200).send({ added: true, id: id });
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
