const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

router.post("/", async (req, res) => {
  try {
    const client = get();

    const user = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    const server = await client
      .db("EgloCloud")
      .collection("Servers")
      .findOne({ id: req.body.server_id });

    if (user.id !== server.server_owner) {
      res.json({ error: "Unauthorized" });
      return;
    }

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Servers")
      .findOne({ id: req.body.server_id });

    await client
      .db("EgloCloud")
      .collection("Servers")
      .updateOne(
        { id: req.body.server_id },
        {
          $set: {
            allow_new_users: !database_interaction.allow_new_users,
          },
        }
      );

    res.json({ success: true });
  } catch (error) {
    res.json({ error: "Failed to change setting" });
  }
});

module.exports = router;
