const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

router.post("/", async (req, res) => {
  try {
    const client = get();

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        { token: req.cookies.token },
        {
          $set: {
            accepting_friend_requests:
              !database_interaction.accepting_friend_requests,
          },
        }
      );

    res.json({success: true});
  } catch (error) {
    res.json({ error: "Failed to change setting" });
  }
});

module.exports = router;
