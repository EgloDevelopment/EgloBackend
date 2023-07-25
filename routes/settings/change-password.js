const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const validator = require("validator");
const bcrypt = require("bcryptjs");

router.post("/", async (req, res) => {
  try {
    if (
      validator.isEmpty(req.body.old_password) === true ||
      validator.isEmpty(req.body.new_password1) === true ||
      validator.isEmpty(req.body.new_password2) === true ||
      req.body.new_password1 !== req.body.new_password2 ||
      validator.isStrongPassword(req.body.new_password1) === false
    ) {
      res.json({ error: "Password is invalid" });
      return;
    }

    const client = get();

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    const compare = await bcrypt.compare(
      req.body.old_password,
      database_interaction.password
    );

    const saltRounds = 10;
    const new_password = await bcrypt.hash(req.body.new_password1, saltRounds);

    if (compare === true) {
      await client
        .db("EgloCloud")
        .collection("Users")
        .updateOne(
          { username: database_interaction.username },
          {
            $set: {
              password: new_password,
              private_key: req.body.new_private_key,
              logged_in: false,
            },
          }
        );
      res.json({ success: true });
    } else {
      res.json({ error: "Incorrect password" });
    }
  } catch (e) {
    console.log(e);
    res.json({ error: "Internal server error" });
  }
});

module.exports = router;
