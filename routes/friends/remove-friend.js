const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const { v4: uuidv4 } = require("uuid");

const { pushNotification } = require("../../functions/push-notification.js");

const { validateBody } = require("../../functions/validate-body.js");

const {
  getUserIDFromToken,
} = require("../../functions/get-user-id-from-token");

router.post("/", async (req, res) => {
  try {
    const errors = await validateBody(req.body, [
      {
        id: {
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

    const friend_join = await client
      .db("EgloCloud")
      .collection("Friends")
      .findOne({ id: req.body.id });

    if (
      friend_join.users.includes(
        await getUserIDFromToken(req.cookies.token)
      ) === false
    ) {
      res.status(403).send({
        error: true,
        fields: ["*"],
        data: "Unauthorized",
      });
      return;
    }

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateMany(
        { "keychain.id": req.body.id },
        {
          $pull: {
            keychain: { id: req.body.id },
          },
        }
      );

    await client
      .db("EgloCloud")
      .collection("Friends")
      .deleteOne({ id: req.body.id });

    await client
      .db("EgloCloud")
      .collection("Messages")
      .deleteMany({ channel_id: friend_join.channel_id });

    res.status(200).send({ removed: true });
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
