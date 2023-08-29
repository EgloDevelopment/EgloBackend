const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const validator = require("validator");
const bcrypt = require("bcryptjs");
const axios = require("axios");

router.post("/", async (req, res) => {
  try {
    const client = get();

    if (validator.isEmpty(req.body.password) === true) {
      res.json({ error: "Password is invalid" });
      return;
    }

    const user = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    if (user !== null) {
      const compare = await bcrypt.compare(req.body.password, user.password);
      if (compare === true) {
        await client
          .db("EgloCloud")
          .collection("Users")
          .deleteOne({ id: user.id });

        await client
          .db("EgloCloud")
          .collection("Messages")
          .deleteMany({ sender_id: user.id });

        const owned_servers = await client
          .db("EgloCloud")
          .collection("Servers")
          .find({ server_owner: user.id })
          .toArray();

        for (const friend of user.friends) {
          await client
            .db("EgloCloud")
            .collection("Users")
            .updateMany(
              { "keychain.id": friend.channel_id },
              {
                $pull: {
                  keychain: { id: friend.channel_id },
                },
              }
            );

          await client
            .db("EgloCloud")
            .collection("Users")
            .updateMany(
              { "friends.channel_id": friend.channel_id },
              {
                $pull: {
                  friends: { channel_id: friend.channel_id },
                },
              }
            );

          await client
            .db("EgloCloud")
            .collection("Messages")
            .deleteMany({ channel_id: friend.channel_id });
        }

        for (const server of owned_servers) {
          await client
            .db("EgloCloud")
            .collection("Users")
            .updateMany(
              { "keychain.id": server.id },
              {
                $pull: {
                  keychain: { id: server.id },
                },
              }
            );

          await client
            .db("EgloCloud")
            .collection("Users")
            .updateMany(
              { "servers.id": server.id },
              {
                $pull: {
                  servers: { id: server.id },
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
            .deleteOne({ id: server.id });
        }

        const json = { subscriber_id: user.ens_subscriber_id };

        await axios
          .post(process.env.ENS_URL + "/delete-subscriber", json);

        res.json({ success: true });
      } else {
        res.json({ error: "Wrong password" });
      }
    } else {
      res.json({ error: "Unauthorized" });
    }
  } catch (e) {
    console.log(e);
    res.json({ error: "Internal server error" });
  }
});

module.exports = router;
