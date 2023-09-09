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

    if (user.id === server.server_owner) {
      res.json({ error: "You can not leave your own server" });
      return;
    }

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        { token: req.cookies.token },
        {
          $pull: {
            keychain: { id: req.body.server_id },
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
            users: req.cookies.id,
          },
        }
      );

    res.json({ success: true });
  } catch (e) {
    console.log(e);
    res.json({ error: "Failed to leave server" });
  }
});

module.exports = router;
