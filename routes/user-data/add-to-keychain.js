const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

require("dotenv").config();

const { validateBody } = require("../../functions/validate-body.js");

router.post("/", async (req, res) => {
  try {
    const errors = await validateBody(req.body, [
      {
        username: {
          type: "string",
          empty: false,
          email: false,
          max_length: 0,
          alphanumeric: true,
          strong_password: false,
        },
      },
      {
        key: {
          type: "string",
          empty: false,
          email: false,
          max_length: 0,
          alphanumeric: false,
          strong_password: false,
        },
      },
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
    ]);

    if (errors) {
      res.status(401).json(errors);
      return;
    }

    const client = get();

    await client
      .db("EgloCloud")
      .collection("Users")
      .updateOne(
        {
          username: req.body.username.toLowerCase(),
        },
        {
          $push: {
            keychain: { key: req.body.key, id: req.body.id },
          },
        }
      );

    res.status(200).send({ added: true });
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
