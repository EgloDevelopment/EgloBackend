const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    let users = [];

    const user = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    const group = await client
      .db("EgloCloud")
      .collection("Groups")
      .findOne({ id: req.body.group_id });

    if (group.users.includes(user.id) === false) {
      res.json({ error: "Unauthorized" });
      return;
    }

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Groups")
      .findOne({ id: req.body.group_id });

    for (const val of database_interaction.users) {
      let users_results = await client
        .db("EgloCloud")
        .collection("Users")
        .findOne({ id: val });

      users.push({ username: users_results.username, id: val });
    }

    res.json({
      users: users,
      name: database_interaction.name,
      id: database_interaction.id,
    });
  } catch {
    res.json({ error: "Failed to get group" });
  }
});

module.exports = router;
