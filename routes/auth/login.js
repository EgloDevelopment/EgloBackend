const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const validator = require("validator");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const browser = require("browser-detect");
const { formatDate } = require("../../functions/formate-date.js");
const { pushNotification } = require("../../functions/push-notification.js");

router.post("/", async (req, res) => {
  try {
    if (validator.isEmpty(req.body.username) === true) {
      res.json({ error: "Username is invalid" });
      return;
    }

    if (validator.isEmpty(req.body.password) === true) {
      res.json({ error: "Password is invalid" });
      return;
    }

    const client = get();

    browser_data = browser(req.headers["user-agent"]);

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ username: req.body.username.toLowerCase() });
    if (database_interaction !== null) {
      if (database_interaction.username === req.body.username.toLowerCase()) {
        const compare = await bcrypt.compare(
          req.body.password,
          database_interaction.password
        );
        if (compare === true) {
          await client
            .db("EgloCloud")
            .collection("Users")
            .updateOne(
              { username: req.body.username.toLowerCase() },
              {
                $set: { last_online: Date.now(), logged_in: true },
              }
            );

          pushNotification(
            [database_interaction.ens_subscriber_id],
            "",
            "New login",
            "Login on " +
              formatDate(Date.now()) +
              " from " +
              browser_data.name.charAt(0).toUpperCase() +
              browser_data.name.slice(1)
          );

          res.json(database_interaction);
        } else {
          res.json({ error: "Password is incorrect" });
        }
      } else {
        res.json({ error: "Password is incorrect" });
      }
    } else {
      res.json({ error: "Password is incorrect" });
    }
  } catch (e) {
    console.log(e);
    res.json({ error: "Internal server error" });
  }
});

module.exports = router;
