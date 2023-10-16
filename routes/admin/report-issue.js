const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

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
        category: {
          type: "string",
          empty: false,
          email: false,
          max_length: 30,
          alphanumeric: false,
          strong_password: false,
        },
      },
      {
        title: {
          type: "string",
          empty: false,
          email: false,
          max_length: 50,
          alphanumeric: false,
          strong_password: false,
        },
      },
      {
        description: {
          type: "string",
          empty: false,
          email: false,
          max_length: 500,
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

    await client.db("EgloCloud").collection("Reports").insertOne({
      user: user.id,
      category: req.body.category,
      title: req.body.title,
      description: req.body.description,
      date: Date.now(),
    });

    pushNotification(
      [user.ens_subscriber_id],
      "",
      "Report submitted",
      "Report was successfully submitted on " + formatDate(Date.now())
    );

    res.status(200).send({
      submitted: true,
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
