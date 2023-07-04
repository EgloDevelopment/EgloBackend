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
        { username: req.body.username.toLowerCase() },
        {
          $push: {
            keychain: { key: req.body.key, id: req.body.id },
          },
        }
      );

    res.json({ success: true });
  } catch (e) {
    console.log(e);
    res.json({ error: "Failed to add to keychain" });
  }
});

module.exports = router;