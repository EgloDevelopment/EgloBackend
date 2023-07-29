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

    const group = await client
      .db("EgloCloud")
      .collection("Groups")
      .findOne({ id: req.body.group_id });

    if (group.users.includes(req.cookies.id) === false) {
      res.json({ error: "Unauthorized" });
      return;
    }

    await client
      .db("EgloCloud")
      .collection("Groups")
      .updateOne(
        { id: req.body.group_id },
        {
          $set: {
            name: req.body.name,
          },
        }
      );

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ error: "Failed to change group name" });
  }
});

module.exports = router;
