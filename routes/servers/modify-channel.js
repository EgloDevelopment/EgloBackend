const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const validator = require("validator");

router.post("/", async (req, res) => {
  try {
    if (req.body.name.length > 25) {
      res.json({ error: "Name is invalid" });
      return;
    }

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
      .collection("Servers")
      .updateOne(
        { id: req.body.server_id },
        {
          $pull: {
            channels: { channel_id: req.body.channel_id },
          },
        }
      );

    if (validator.isEmpty(req.body.name) === false) {
      await client
        .db("EgloCloud")
        .collection("Servers")
        .updateOne(
          { id: req.body.server_id },
          {
            $push: {
              channels: {
                name: req.body.name,
                channel_id: req.body.channel_id,
              },
            },
          }
        );
      res.json({ success: "Updated channel name" });
    } else {
      await client
        .db("EgloCloud")
        .collection("Messages")
        .deleteMany({ channel_id: req.body.channel_id });
      res.json({ success: "Deleted channel" });
    }
  } catch (error) {
    console.log(error);
    res.json({ error: "Failed to change channel name" });
  }
});

module.exports = router;
