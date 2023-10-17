const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const browser = require("browser-detect");
const { formatDate } = require("../../functions/format-date.js");
const { pushNotification } = require("../../functions/push-notification.js");

const { validateBody } = require("../../functions/validate-body.js");
const bcrypt = require("bcryptjs");
const {
  getUserIDFromToken,
} = require("../../functions/get-user-id-from-token");

router.post("/", async (req, res) => {
  try {
    const errors = await validateBody(req.body, [
      {
        old_password: {
          type: "string",
          empty: false,
          email: false,
          max_length: 0,
          alphanumeric: false,
          strong_password: false,
        },
      },
      {
        new_password1: {
          type: "string",
          empty: false,
          email: false,
          max_length: 0,
          alphanumeric: false,
          strong_password: true,
        },
      },
      {
        new_password2: {
          type: "string",
          empty: false,
          email: false,
          max_length: 0,
          alphanumeric: false,
          strong_password: true,
        },
      },
      {
        new_private_key: {
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

    if (req.body.new_password1 !== req.body.new_password2) {
      res.status(401).send({
        error: true,
        fields: ["new_password1"],
        data: "New Password 1 does not match New Password 2",
      });
      return;
    }

    if (req.body.new_password2 !== req.body.new_password1) {
      res.status(401).send({
        error: true,
        fields: ["new_password2"],
        data: "New Password 2 does not match New Password 1",
      });
      return;
    }

    const client = get();

    browser_data = browser(req.headers["user-agent"]);

    const user = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ id: await getUserIDFromToken(req.cookies.token) });

    const password_compare = await bcrypt.compare(
      req.body.old_password,
      user.password
    );

    if (password_compare !== true) {
      res.status(403).send({
        error: true,
        fields: ["old_password"],
        data: "Incorrect password",
      });
      return;
    }

    const saltRounds = 10;
    const new_password = await bcrypt.hash(req.body.new_password1, saltRounds);

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        { id: user.id },
        {
          $set: {
            password: new_password,
            private_key: req.body.new_private_key,
            logged_in: false,
          },
        }
      );

    try {
      pushNotification(
        [user.ens_subscriber_id],
        "",
        "Settings update",
        "Settings were changed on " +
          formatDate(Date.now()) +
          " from " +
          browser_data.name.charAt(0).toUpperCase() +
          browser_data.name.slice(1)
      );
    } catch {
      pushNotification(
        [user.ens_subscriber_id],
        "",
        "Settings update",
        "Settings were changed on " + formatDate(Date.now())
      );
    }

    res.status(200).send({
      updated: true,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: true,
      fields: ["*"],
      data: "Internal server error",
    });
    return;
  }
});

module.exports = router;
