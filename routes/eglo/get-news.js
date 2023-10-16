const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

router.post("/", async (req, res) => {
  try {
    const client = get();

    const news = await client.db("EgloCloud").collection("News").findOne({active: true});

    res.status(200).send(news);
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: true,
      fields: ["*"],
      data: "Internal server error",
    });
    return;
  }
});

module.exports = router;
