const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

const validator = require("validator");
const { v4: uuidv4 } = require("uuid");

router.post("/", async (req, res) => {
  try {
    if (validator.isEmpty(req.body.name) === true) {
      res.json({ error: "Name is invalid" });
      return;
    }

    const client = get();

    await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    let id = uuidv4();

    await client
      .db("EgloCloud")
      .collection("Servers")
      .insertOne({
        name: req.body.name.trim(),
        id: id,
        channels: [],
        users: [req.cookies.id],
        allow_new_users: true,
        server_owner: req.cookies.id,
      });

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        { token: req.cookies.token },
        {
          $push: {
            servers: { id: id, visible: true },
          },
        }
      );

    res.json({ success: true, id: id });
  } catch (e) {
    console.log(e);
    res.json({ error: "Failed to create server" });
  }
});

module.exports = router;
