const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const axios = require("axios");

router.post("/", async (req, res) => {
  try {
    const wallet_result = await axios.get(
      process.env.EPS_URL + `/bitcoin/poll-wallet?wallet=${req.body.wallet}`
    );

    res.status(200).send(wallet_result.data);
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
