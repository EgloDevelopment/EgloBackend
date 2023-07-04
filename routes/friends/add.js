const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

const { v4: uuidv4 } = require("uuid");

router.post("/", async (req, res) => {
  try {
    const client = get();

    let user_receiving_friend_request = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ username: req.body.username });

    if (user_receiving_friend_request !== null) {
      if (user_receiving_friend_request.accepting_friend_requests === true) {
        if (
          user_receiving_friend_request.blocked_users.includes(
            req.cookies.id
          ) === false
        ) {
          const other_user_friends_list =
            user_receiving_friend_request.friends.filter(
              (item) => item.other_user === req.cookies.id
            );

          if (other_user_friends_list.length === 0) {
            let channel_id = uuidv4();

            await client
              .db("EgloCloud")
              .collection("Users")
              .updateOne(
                { id: req.cookies.id },
                {
                  $push: {
                    friends: {
                      other_user: user_receiving_friend_request.id,
                      channel_id: channel_id,
                      visible: true,
                    },
                  },
                }
              );

            await client
              .db("EgloCloud")
              .collection("Users")
              .updateOne(
                { id: user_receiving_friend_request.id },
                {
                  $push: {
                    friends: {
                      other_user: req.cookies.id,
                      channel_id: channel_id,
                      visible: true,
                    },
                  },
                }
              );

            res.json({ success: true, channel_id: channel_id });
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
