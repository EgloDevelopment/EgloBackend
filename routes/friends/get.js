const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const friend_array = [];

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    const data_from_friends_db = await client
      .db("EgloCloud")
      .collection("Friends")
      .find({ users: database_interaction.id })
      .toArray();

    for (const val of data_from_friends_db) {
      for (const user of val.users) {
        if (user !== req.cookies.id) {
          let friend = await client
            .db("EgloCloud")
            .collection("Users")
            .findOne({ id: user });
          friend_array.push({
            username: friend.username,
            preferred_name: friend.preferred_name,
            id: friend.id,
            logged_in: friend.logged_in,

            friend_id: val.id,
            channel_id: val.channel_id,
          });
        }
      }
    }

    res.json(friend_array);
  } catch (e) {
    console.log(e);
    res.json({ error: "Failed to get user data" });
  }
});

module.exports = router;
