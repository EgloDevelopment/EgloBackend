const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

const { getUserIDFromToken } = require("../../functions/get-user-id-from-token")

router.post("/", async (req, res) => {
  try {
    if (req.cookies.token === null || req.cookies.token === "") {
      res.status(403).send({
        error: true,
        fields: ["*"],
        data: "No token provided",
      });
      return;
    }
    const client = get();

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ id: await getUserIDFromToken(req.cookies.token) });

    if (
      database_interaction !== null &&
      database_interaction.logged_in === true
    ) {
      res.status(200).send({ logged_in: true });
    } else {
      res.status(403).send({
        error: true,
        fields: ["*"],
        data: "Database conflict with session",
      });
      return;
    }
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
