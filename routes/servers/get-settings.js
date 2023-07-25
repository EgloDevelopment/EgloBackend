const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    let users = [];

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Servers")
      .findOne({ id: req.body.server_id });

    for (const val of database_interaction.users) {
      let users_results = await client
        .db("EgloCloud")
        .collection("Users")
        .findOne({ id: val });

      users.push({ username: users_results.username, id: val });
    }

    res.json({
      channels: database_interaction.channels,
      users: users,
      name: database_interaction.name,
      id: database_interaction.id,
      allow_new_users: database_interaction.allow_new_users,
    });
  } catch (e) {
    console.log(e);
    res.json({ error: "Failed to get user data" });
  }
});

module.exports = router;
