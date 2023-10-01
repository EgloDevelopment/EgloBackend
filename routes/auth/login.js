const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const bcrypt = require("bcryptjs");

const browser = require("browser-detect");
const { formatDate } = require("../../functions/format-date.js");
const { pushNotification } = require("../../functions/push-notification.js");

const { validateBody } = require("../../functions/validate-body.js");

const { encryptUserID } = require("../../functions/encrypt-user-id.js");

router.post("/", async (req, res) => {
  try {
    const errors = await validateBody(req.body, [
      {
        username: {
          type: "string",
          empty: false,
          email: false,
          max_length: 0,
          alphanumeric: false,
          strong_password: false,
        },
      },
      {
        password: {
          type: "string",
          empty: false,
          email: false,
          max_length: 0,
          alphanumeric: false,
          strong_password: false,
        },
      },
    ]);

    if (errors) {
      res.status(401).json(errors);
      return;
    }

    const client = get();

    browser_data = browser(req.headers["user-agent"]);

    const user = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ username: req.body.username.toLowerCase() });

    if (user === null) {
      res.status(403).send({
        error: true,
        fields: ["username"],
        data: "User does not exist",
      });
      return;
    }

    const password_compare = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (password_compare !== true) {
      res.status(403).send({
        error: true,
        fields: ["password"],
        data: "Incorrect password",
      });
      return;
    }

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        { id: user.id },
        {
          $set: { last_online: Date.now(), logged_in: true },
        }
      );

    try {
      pushNotification(
        [user.ens_subscriber_id],
        "",
        "New login",
        "Login on " +
          formatDate(Date.now()) +
          " from " +
          browser_data.name.charAt(0).toUpperCase() +
          browser_data.name.slice(1)
      );
    } catch {
      pushNotification(
        [user.ens_subscriber_id],
        "",
        "New login",
        "Login on " + formatDate(Date.now())
      );
    }

    res.status(200).send({
      token: await encryptUserID(user.id),
      private_key: user.private_key,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: true,
      fields: ["*"],
      data: "Internal server error",
    });
  }
});

module.exports = router;
