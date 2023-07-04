const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const validator = require("validator");
const bcrypt = require("bcryptjs");

router.post("/", async (req, res) => {
  try {
    if (
      validator.isEmpty(req.body.username) === true
    ) {
      res.json({ error: "Username is invalid" });
      return;
    }

    if (validator.isEmpty(req.body.password) === true) {
      res.json({ error: "Password is invalid" });
      return;
    }

    const client = get();

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
          res.json(database_interaction);
        } else {
          res.json({ error: "Incorrect credentials" });
        }
      } else {
        res.json({ error: "Incorrect credentials" });
      }
    } else {
      res.json({ error: "Incorrect credentials" });
    }
  } catch (e) {
    console.log(e);
    res.json({ error: "Internal server error" });
  }
});

module.exports = router;