const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const { v4: uuidv4 } = require("uuid");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const axios = require("axios")

router.post("/", async (req, res) => {
  try {
    if (
      validator.isAlphanumeric(req.body.username) === false ||
      validator.isEmpty(req.body.username) === true ||
      req.body.username.length > 20
    ) {
      res.json({ error: "Username is invalid" });
      return;
    }

    if (
      validator.isEmpty(req.body.password1) === true ||
      validator.isEmpty(req.body.password2) === true ||
      req.body.password1 !== req.body.password2
    ) {
      res.json({ error: "Password is invalid" });
      return;
    }

    const client = get();

    if (
      (await client
        .db("EgloCloud")
        .collection("Users")
        .findOne({ username: req.body.username.toLowerCase() })) === null
    ) {
      const saltRounds = 10;
      const hash = await bcrypt.hash(req.body.password1, saltRounds);
      let token = uuidv4();
      let id = uuidv4();
      await client.db("EgloCloud").collection("Users").insertOne({
        username: req.body.username.toLowerCase(),
        preffered_name: "",
        password: hash,
        logged_in: false,

        last_online: Date.now(),
        token: token,
        id: id,

        about_me: "",
        
        accepting_friend_requests: true,

        keychain: [],

        friends: [],

        servers: [],

        blocked_users: [],

        public_key: req.body.public_key,
        private_key: req.body.private_key,

        recovery_email: "",
        recoverable: false,
        recovery_code: "",

        ens_subscriber_id: "",

        language: req.headers["accept-language"].split(',')[0],
        subscription: "free"
      });
      res.json({ success: true, id: id });
    } else {
      res.json({ error: "Username is taken" });
    }
  } catch (e) {
    res.json({ error: "Internal server error" });
  }
});

module.exports = router;
