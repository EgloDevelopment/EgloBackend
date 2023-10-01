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

    const user = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ id: await getUserIDFromToken(req.cookies.token) });

    res.status(200).send(user)
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
