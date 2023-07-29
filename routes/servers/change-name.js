const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const validator = require("validator");

router.post("/", async (req, res) => {
  try {
    if (
      req.body.name.length > 25 ||
      validator.isEmpty(req.body.name) === true
    ) {
      res.json({ error: "Name is invalid" });
      return;
    }

    const client = get();

    const user = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    const server = await client
      .db("EgloCloud")
      .collection("Servers")
      .findOne({ id: req.body.server_id });

    if (user.id !== server.server_owner) {
      res.json({ error: "Unauthorized" });
      return;
    }

    await client
      .db("EgloCloud")
      .collection("Servers")
      .updateOne(
        { id: req.body.server_id },
        {
          $set: {
            name: req.body.name,
          },
        }
      );

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ error: "Failed to change server name" });
  }
});

module.exports = router;
