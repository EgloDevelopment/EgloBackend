const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const {
  getUserIDFromToken,
} = require("../../functions/get-user-id-from-token");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const requester_id = await getUserIDFromToken(req.cookies.token);

    const groups = await client
      .db("EgloCloud")
      .collection("Groups")
      .find({ users: requester_id })
      .toArray();

    res.status(200).send(groups);
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
