const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const validator = require("validator")

router.post("/", async (req, res) => {
  try {
    if (req.body.about_me.length > 200) {
      res.json({ error: "About me is invalid" });
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
            about_me: req.body.about_me
          },
        }
      );

    res.json({ success: true });
  } catch (error) {
    res.json({ error: "Failed to change about me" });
  }
});

module.exports = router;
