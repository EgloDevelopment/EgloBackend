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

    const keychain = database_interaction.keychain.filter(
      (item) => item.id === req.body.id
    );

    res.json(keychain);
  } catch (e) {
    console.log(e);
    res.json({ error: "Failed to get key" });
  }
});

module.exports = router;
