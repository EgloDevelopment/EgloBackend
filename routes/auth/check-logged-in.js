const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

const validator = require("validator");

router.post("/", async (req, res) => {
  try {
  if (validator.isEmpty(req.cookies.token) === true) {
    res.json({ status: false });
    return;
  }

  const client = get();

  const database_interaction = await client
    .db("EgloCloud")
    .collection("Users")
    .findOne({ token: req.cookies.token });

  if (
    database_interaction !== null &&
    database_interaction.token === req.cookies.token &&
    database_interaction.logged_in === true &&
    database_interaction.id === req.cookies.id
  ) {
    res.json({ status: true });
  } else {
    res.json({ status: false });
  }
} catch(e) {
  res.json({status: false})
}
});

module.exports = router;