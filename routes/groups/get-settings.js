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

    if (group.users.includes(requester_id) === false) {
      res.status(403).send({
        error: true,
        fields: ["*"],
        data: "Unauthorized",
      });
      return;
    }

    let users_array = [];

    for (const user_id of group.users) {
      let user = await client
        .db("EgloCloud")
        .collection("Users")
        .findOne({ id: user_id });

      users_array.push({ username: user.username, id: user.id });
    }

    res.status(200).send({name: group.name, users: users_array, id: group.id});
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
