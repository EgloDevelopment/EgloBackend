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
      .findOne({ id: req.body.id });

    if (server !== null) {
      if (server.allow_new_users !== false) {
        if (server.users.includes(user.id) === false) {
          await client
            .db("EgloCloud")
            .collection("Servers")
            .updateOne(
              { id: req.body.id },
              {
                $push: {
                  users: user.id,
                },
              }
            );

          res.json({ success: true });
        } else {
          res.json({ error: "You are already in this server" });
        }
      } else {
        res.json({ error: "Server does not currently allow new users" });
      }
    } else {
      res.json({ error: "Server does not exist" });
    }
  } catch (e) {
    console.log(e);
    res.json({ error: "Failed to join server" });
  }
});

module.exports = router;
