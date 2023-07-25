const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const validator = require("validator");
const { v4: uuidv4 } = require("uuid");

router.post("/", async (req, res) => {
  try {
    const client = get();

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        { token: req.cookies.token },
        {
          $set: { logged_in: false },
        }
      );

    res.json({ success: true });
  } catch (e) {
    console.log(e);
    res.json({ error: "Internal server error" });
  }
});

module.exports = router;
