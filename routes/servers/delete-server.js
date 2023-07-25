const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

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

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateMany(
        { "keychain.id": req.body.server_id },
        {
          $pull: {
            keychain: { id: req.body.server_id },
          },
        }
      );

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateMany(
        { "servers.id": req.body.server_id },
        {
          $pull: {
            servers: { id: req.body.server_id },
          },
        }
      );

    for (const val of server.channels) {
      client
        .db("EgloCloud")
        .collection("Messages")
        .deleteMany({ channel_id: val.channel_id });
    }

    await client
      .db("EgloCloud")
      .collection("Servers")
      .deleteOne({ id: req.body.server_id });

    res.json({ success: true });
  } catch {
    res.json({ error: "Failed to delete server" });
  }
});

module.exports = router;
