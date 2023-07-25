const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const validator = require("validator");

router.post("/", async (req, res) => {
  try {
    if (validator.isEmpty(req.body.new_email) !== true) {
      if (validator.isEmail(req.body.new_email) === false) {
        res.json({ error: "Not a valid email" });
        return;
      }
    }

    const client = get();

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        { token: req.cookies.token },
        {
          $set: {
            recovery_email: req.body.new_email,
          },
        }
      );

    res.json({ success: true });
  } catch (error) {
    res.json({ error: "Failed to change recovery email" });
  }
});

module.exports = router;
