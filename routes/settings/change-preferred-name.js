const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const validator = require("validator");

router.post("/", async (req, res) => {
  try {
    if (
      validator.isAlphanumeric(req.body.preferred_name) === false ||
      req.body.preferred_name.length > 20
    ) {
      res.json({ error: "Preferred name is invalid" });
      return;
    }

    const client = get();

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        { token: req.cookies.token },
        {
          $set: {
            preferred_name: req.body.preferred_name,
          },
        }
      );

    res.json({ success: true });
  } catch (error) {
    res.json({ error: "Failed to change preferred name" });
  }
});

module.exports = router;
