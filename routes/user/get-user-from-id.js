const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ id: req.body.id });

    delete database_interaction.token;
    delete database_interaction.keychain;
    delete database_interaction.friends;
    delete database_interaction.servers;
    delete database_interaction.blocked_users;
    delete database_interaction.last_online;
    delete database_interaction.available_space;
    delete database_interaction.logged_in;
    delete database_interaction.private_key;
    delete database_interaction.password;
    delete database_interaction.recoverable;
    delete database_interaction.recovery_code;
    delete database_interaction.recovery_email;
    delete database_interaction.ens_subscriber_id;

    res.json(database_interaction);
  } catch {
    res.json({ error: "Failed to get user data" });
  }
});

module.exports = router;
