const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const server = await client
      .db("EgloCloud")
      .collection("Servers")
      .findOne({ id: req.body.server_id });

    const user = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    if (user.id !== server.server_owner) {
      res.json({ error: "Unauthorized" });
      return;
    }

    if (server.server_owner === req.body.user_id) {
      res.json({ error: "You can not remove yourself from your own server" });
      return;
    }

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        { id: req.body.user_id },
        {
          $pull: {
            keychain: { id: req.body.server_id },
          },
        }
      );

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        { id: req.body.user_id },
        {
          $pull: {
            servers: { id: req.body.server_id },
          },
        }
      );

    await client
      .db("EgloCloud")
      .collection("Servers")
      .updateOne(
        { id: req.body.server_id },
        {
          $pull: {
            users: req.body.user_id,
          },
        }
      );

    res.json({ success: true });
  } catch {
    res.json({ error: "Failed to remove user" });
  }
});

module.exports = router;
