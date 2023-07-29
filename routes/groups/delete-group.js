const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const group = await client
      .db("EgloCloud")
      .collection("Groups")
      .findOne({ id: req.body.group_id });

    if (group.users.includes(req.cookies.id) === false) {
      res.json({ error: "Unauthorized" });
      return;
    }

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateMany(
        { "keychain.id": req.body.group_id },
        {
          $pull: {
            keychain: { id: req.body.group_id },
          },
        }
      );

    await client
      .db("EgloCloud")
      .collection("Groups")
      .deleteOne({ id: req.body.group_id });

    await client
      .db("EgloCloud")
      .collection("Messages")
      .deleteMany({ channel_id: group.channel_id });

    res.json({ success: true });
  } catch {
    res.json({ error: "Failed to delete group" });
  }
});

module.exports = router;
