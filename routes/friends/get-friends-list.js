const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const {
  getUserIDFromToken,
} = require("../../functions/get-user-id-from-token");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const friend_array = [];

    const requester_id = await getUserIDFromToken(req.cookies.token)

    const raw_friends_data = await client
      .db("EgloCloud")
      .collection("Friends")
      .find({ users: requester_id })
      .toArray();

    for (const val of raw_friends_data) {
      for (const user of val.users) {
        if (user !== requester_id) {
          let friend = await client
            .db("EgloCloud")
            .collection("Users")
            .findOne({ id: user });
          friend_array.push({
            username: friend.username,
            preferred_name: friend.preferred_name,
            friend_id: friend.id,
            logged_in: friend.logged_in,

            id: val.id,
            channel_id: val.channel_id,
          });
        }
      }
    }

    res.status(200).send(friend_array);
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
