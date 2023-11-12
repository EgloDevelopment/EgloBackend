const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const { validateBody } = require("../../functions/validate-body.js");

const {
  getUserIDFromToken,
} = require("../../functions/get-user-id-from-token");

router.post("/", async (req, res) => {
  try {
    const errors = await validateBody(req.body, [
      {
        id: {
          type: "string",
          empty: false,
          email: false,
          max_length: 0,
          alphanumeric: false,
          strong_password: false,
        },
      },
      {
        name: {
          type: "string",
          empty: false,
          email: false,
          max_length: 25,
          alphanumeric: false,
          strong_password: false,
        },
      },
    ]);

    if (errors) {
      res.status(401).json(errors);
      return;
    }

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

    await client
      .db("EgloCloud")
      .collection("Groups")
      .updateOne(
        { id: group.id },
        {
          $set: {
            name: req.body.name,
          },
        }
      );

    res.status(200).send({
      updated: true,
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
