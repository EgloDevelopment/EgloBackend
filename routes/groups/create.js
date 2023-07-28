const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

const { v4: uuidv4 } = require("uuid");
const validator = require("validator");

router.post("/", async (req, res) => {
  try {
    const client = get();

    let user_name_array = [];
    let user_id_array = []

    let id = uuidv4()
    let channel_id = uuidv4()

    for (const val of req.body.users) {
      let user = await client
        .db("EgloCloud")
        .collection("Users")
        .findOne({ username: val.trim() });

      if (user === null) {
        res.json({ error: "User " + val.trim() + " does not exist" });
        return;
      } else {
        user_id_array.push(user.id)
        user_name_array.push(user.username);
      }
    }

    user_id_array.push(req.cookies.id)
    user_name_array.push(req.cookies.username)

    await client
      .db("EgloCloud")
      .collection("Groups")
      .insertOne({ name: "New group", users: user_id_array, id: id, channel_id: channel_id });

    res.json({ users: user_name_array });
  } catch (e) {
    console.log(e);
    res.json({ error: "Failed to create group" });
  }
});

module.exports = router;
