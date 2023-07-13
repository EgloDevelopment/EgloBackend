const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

router.post("/", async (req, res) => {
  try {
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

    res.json({success: true});
  } catch (error) {
    res.json({ error: "Failed to change recovery email" });
  }
});

module.exports = router;
