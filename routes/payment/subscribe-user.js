const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

router.post("/", async (req, res) => {
  try {
    if (req.query.key !== process.env.BACKEND_AUTH_KEY) {
      res.status(403).send({
        error: true,
        fields: ["*"],
        data: "Unauthorized",
      });
      return;
    }

    const client = get();

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        {
          id: req.query.user_id,
        },
        {
          $set: {
            subscription: "basic",
            subscription_expires: Date.now() + 86400000 * 31, //31 Days from when the subscription was created in Miliseconds
          },
        }
      );

    res.status(200).send({ subscribed: true });
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
