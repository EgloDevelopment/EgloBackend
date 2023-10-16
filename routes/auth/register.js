const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const axios = require("axios");

const browser = require("browser-detect");

const { validateBody } = require("../../functions/validate-body.js");
const {
  generatePhoneNumber,
} = require("../../functions/generate-phone-number.js");

const { encryptUserID } = require("../../functions/encrypt-user-id.js");

router.post("/", async (req, res) => {
  try {
    const errors = await validateBody(req.body, [
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
        password1: {
          type: "string",
          empty: false,
          email: false,
          max_length: 0,
          alphanumeric: false,
          strong_password: true,
        },
      },
      {
        password2: {
          type: "string",
          empty: false,
          email: false,
          max_length: 0,
          alphanumeric: false,
          strong_password: true,
        },
      },
    ]);

    if (errors) {
      res.status(401).json(errors);
      return;
    }

    if (req.body.password1 !== req.body.password2) {
      res.status(401).send({
        error: true,
        fields: ["password1"],
        data: "Password 1 does not match password 2",
      });
      return;
    }

    if (req.body.password2 !== req.body.password1) {
      res.status(401).send({
        error: true,
        fields: ["password2"],
        data: "Password 2 does not match password 1",
      });
      return;
    }

    const client = get();

    browser_data = browser(req.headers["user-agent"]);

    const user = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ username: req.body.username.toLowerCase() });

    if (user !== null) {
      res.status(401).send({
        error: true,
        fields: ["username"],
        data: "User already exists",
      });
      return;
    }

    let ens_id = uuidv4();
    let user_id = uuidv4();

    const json = { subscriber_id: ens_id, email: "" };

    await axios
      .post(process.env.ENS_URL + "/new-subscriber", json)
      .then((response) => {
        if (response.data.success === false) {
          res.status(500).send({
            error: true,
            fields: ["*"],
            data: "Failed to register with the ENS service",
          });
          return;
        }
      });

    const saltRounds = 10;
    const hash = await bcrypt.hash(req.body.password1, saltRounds);

    await client
      .db("EgloCloud")
      .collection("Users")
      .insertOne({
        username: req.body.username.toLowerCase(),
        preferred_name: "",
        password: hash,
        logged_in: true,
        eglo_number: await generatePhoneNumber(),

        last_online: Date.now(),
        id: user_id,

        about_me: "",

        accepting_friend_requests: true,

        keychain: [],

        blocked_users: [],

        public_key: req.body.public_key,
        private_key: req.body.private_key,

        recovery_email: "",
        recoverable: false,
        recovery_code: "",

        ens_subscriber_id: ens_id,

        language: req.headers["accept-language"].split(",")[0],
        subscription: "free",
      });

    res.status(200).send({
      token: await encryptUserID(user_id),
      private_key: req.body.private_key,
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
