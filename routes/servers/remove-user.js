const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

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
            servers: req.body.server_id,
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

    await client
      .db("EgloCloud")
      .collection("Messages")
      .deleteMany({ sender_id: req.body.user_id });

    res.json({ success: true });
  } catch {
    res.json({ error: "Failed to remove user" });
  }
});

module.exports = router;
