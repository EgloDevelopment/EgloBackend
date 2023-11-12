const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const { v4: uuidv4 } = require("uuid");

const { pushNotification } = require("../../functions/push-notification.js");

const { validateBody } = require("../../functions/validate-body.js");

const {
  getUserIDFromToken,
} = require("../../functions/get-user-id-from-token");

router.post("/", async (req, res) => {
  try {
    if (req.body.users.length <= 1) {
      res.status(401).send({
        error: true,
        fields: ["usernames"],
        data: "You must have more than one other person in a group",
      });
      return;
    }

    const client = get();

    let user_id_array = [];
    let user_name_array = [];

    let id = uuidv4();
    let channel_id = uuidv4();

    let creator_profile = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ id: await getUserIDFromToken(req.cookies.token) });

    for (const user_username of req.body.users) {
      let user_profile = await client
        .db("EgloCloud")
        .collection("Users")
        .findOne({ username: user_username.trim().toLowerCase() });

      if (user_profile === null) {
        res.status(401).send({
          error: true,
          fields: ["usernames"],
          data: `User ${user_username} does not exist`,
        });
        return;
      }

      if (user_profile.id === creator_profile.id) {
        res.status(401).send({
          error: true,
          fields: ["usernames"],
          data: "You can not add yourself",
        });
        return;
      }

      let friend_check = await client
        .db("EgloCloud")
        .collection("Friends")
        .findOne({ users: { $all: [creator_profile.id, user_profile.id] } });

      if (friend_check === null) {
        res.status(403).send({
          error: true,
          fields: ["usernames"],
          data: `You are not friends with ${user_username}`,
        });
        return;
      }

      user_id_array.push(user_profile.id);
      user_name_array.push(user_profile.username);
    }

    user_id_array.push(creator_profile.id);
    user_name_array.push(creator_profile.username);

    await client.db("EgloCloud").collection("Groups").insertOne({
      name: "New Group",
      users: user_id_array,
      id: id,
      channel_id: channel_id,
      group_owner: creator_profile.id,
    });

    res.status(200).send({ created: true, users: user_name_array, id: id });
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
