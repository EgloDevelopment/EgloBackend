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

    const group = await client
      .db("EgloCloud")
      .collection("Groups")
      .findOne({ id: req.body.id });

    if (group.group_owner !== requester_id) {
      res.status(403).send({
        error: true,
        fields: ["*"],
        data: "Unauthorized",
      });
      return;
    }

    await client
      .db("EgloCloud")
      .collection("Messages")
      .deleteMany({ channel_id: group.channel_id });

    await client
      .db("EgloCloud")
      .collection("Groups")
      .deleteOne({ id: req.body.id });

    res.status(200).send({deleted: true});
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
