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

    for (const val of database_interaction.friends) {
      let friend = await client
        .db("EgloCloud")
        .collection("Users")
        .findOne({ id: val.other_user });
      friend_array.push({
        username: friend.username,
        id: friend.id,
        channel_id: val.channel_id,
      });
    }

    res.json(friend_array);
  } catch {
    res.json({ error: "Failed to get user data" });
  }
});

module.exports = router;
