const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const server = await client
      .db("EgloCloud")
      .collection("Servers")
      .findOne({ id: req.body.id });

    if (server !== null) {
      if (server.allow_new_users !== false) {
        if (server.users.includes(req.cookies.id) === false) {
          await client
            .db("EgloCloud")
            .collection("Users")
            .updateOne(
              { token: req.cookies.token },
              {
                $push: {
                  servers: { id: req.body.id, visible: true },
                },
              }
            );

          await client
            .db("EgloCloud")
            .collection("Servers")
            .updateOne(
              { id: req.body.id },
              {
                $push: {
                  users: req.cookies.id,
                },
              }
            );

          res.json({ success: true });
        } else {
          res.json({ error: "You are already in this server" });
        }
      } else {
        res.json({ error: "Server does not allow joining" });
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
