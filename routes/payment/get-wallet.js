const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const { formatDate } = require("../../functions/format-date.js");
const { pushNotification } = require("../../functions/push-notification.js");

const axios = require("axios");

const { validateBody } = require("../../functions/validate-body.js");

const {
  getUserIDFromToken,
} = require("../../functions/get-user-id-from-token");

router.post("/", async (req, res) => {
  try {
    /*
    const errors = await validateBody(req.body, [
      {
        category: {
          type: "string",
          empty: false,
          email: false,
          max_length: 30,
          alphanumeric: false,
          strong_password: false,
        },
      },
    ]);

    if (errors) {
      res.status(401).json(errors);
      return;
    }
    */

    const client = get();

    const user = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ id: await getUserIDFromToken(req.cookies.token) });

    const payment_data = await axios.post(
      process.env.EPS_URL + "/bitcoin/create-payment",
      {
        amount: 7,
        webhook_to_post_to: `${process.env.LOCAL_SERVER_URL}/payment/subscribe-user?user_id=${user.id}&key=${process.env.BACKEND_AUTH_KEY}`,
      }
    );

    res.status(200).send({
      payment_id: payment_data.data.payment_id,
      wallet: payment_data.data.wallet_address,
      btc: payment_data.data.amount_btc,
    });
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
