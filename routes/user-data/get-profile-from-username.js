const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const { validateBody } = require("../../functions/validate-body.js");

router.post("/", async (req, res) => {
  try {
    const errors = await validateBody(req.body, [
      {
        username: {
          type: "string",
          empty: false,
          email: false,
          max_length: 0,
          alphanumeric: true,
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
      .findOne({ username: req.body.username.toLowerCase() });

    delete user.token;
    delete user.keychain;
    delete user.blocked_users;
    delete user.private_key;
    delete user.password;
    delete user.recoverable;
    delete user.recovery_code;
    delete user.recovery_email;
    delete user.ens_subscriber_id;
    delete user.subscription_expires;

    res.status(200).send(user);
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
