const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    const server_array = await client
    .db("EgloCloud")
    .collection("Servers")
    .find({ users: database_interaction.id })
    .toArray();

    res.json(server_array);
  } catch (e) {
    console.log(e);
    res.json({ error: "Failed to get user data" });
  }
});

module.exports = router;
