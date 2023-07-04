const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateMany(
        { "keychain.id": req.body.channel_id },
        {
          $pull: {
            keychain: { id: req.body.channel_id },
          },
        }
      );

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateMany(
        { "friends.channel_id": req.body.channel_id },
        {
          $pull: {
            friends: { channel_id: req.body.channel_id },
          },
        }
      );

    await client
      .db("EgloCloud")
      .collection("Messages")
      .deleteMany({ channel_id: req.body.channel_id });

    res.json({ success: true });
  } catch {
    res.json({ error: "Failed to remove friend" });
  }
});

module.exports = router;
