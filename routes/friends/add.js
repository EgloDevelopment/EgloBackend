const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

const { v4: uuidv4 } = require("uuid");
const validator = require("validator");

const { pushNotification } = require("../../functions/push-notification");

router.post("/", async (req, res) => {
  try {
    const client = get();

    if (validator.isEmpty(req.body.username) === true) {
      res.json({ error: "Username is invalid" });
      return;
    }

    let user_receiving_friend_request = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ username: req.body.username.toLowerCase() });

    let user_sending_friend_request = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    if (user_receiving_friend_request !== null) {
      if (
        user_sending_friend_request.username ===
        user_receiving_friend_request.username
      ) {
        res.json({ error: "You can not add yourself" });
        return;
      }
      if (user_receiving_friend_request.accepting_friend_requests === true) {
        if (
          user_receiving_friend_request.blocked_users.includes(
            user_sending_friend_request.id
          ) === false
        ) {
          check_friend_if_added = await client
            .db("EgloCloud")
            .collection("Friends")
            .findOne({
              users: {
                $all: [
                  user_sending_friend_request,
                  user_receiving_friend_request,
                ],
              },
            });

          

          if (check_friend_if_added === null) {
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

            res.json({ success: true, id: id });
          } else {
            res.json({ error: "You already have this person added" });
          }
        } else {
          res.json({ error: "You have been blocked by this user" });
        }
      } else {
        res.json({ error: "User is not accepting friend requests" });
      }
    } else {
      res.json({ error: "User does not exist" });
    }
  } catch (e) {
    console.log(e);
    res.json({ error: "Failed to add friend" });
  }
});

module.exports = router;
