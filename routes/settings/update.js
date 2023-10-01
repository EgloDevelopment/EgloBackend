const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

const browser = require("browser-detect");
const { formatDate } = require("../../functions/format-date.js");
const { pushNotification } = require("../../functions/push-notification.js");

const { validateBody } = require("../../functions/validate-body.js");

const {
  getUserIDFromToken,
} = require("../../functions/get-user-id-from-token");

router.post("/", async (req, res) => {
  try {
    const errors = await validateBody(req.body, [
      {
        preferred_name: {
          type: "string",
          empty: true,
          email: false,
          max_length: 15,
          alphanumeric: false,
          strong_password: false,
        },
      },
      {
        username: {
          type: "string",
          empty: false,
          email: false,
          max_length: 20,
          alphanumeric: true,
          strong_password: false,
        },
      },
      {
        recovery_email: {
          type: "string",
          empty: true,
          email: true,
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
      .findOne({ id: await getUserIDFromToken(req.cookies.token) });

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        { id: user.id },
        {
          $set: {
            preferred_name: req.body.preferred_name,
            username: req.body.username,
            recovery_email: req.body.recovery_email,
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
