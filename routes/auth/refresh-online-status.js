const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const { getUserIDFromToken } = require("../../functions/get-user-id-from-token")

router.post("/", async (req, res) => {
  try {
    const client = get();

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        { id: await getUserIDFromToken(req.cookies.token) },
        {
          $set: { last_online: Date.now() },
        }
      );

    res.status(200).send({
      refreshed: true
    });
  } catch(e) {
    console.log(e)
    res.status(500).send({
      error: true,
      fields: ["*"],
      data: "Internal server error",
    });
  }
});

module.exports = router;
