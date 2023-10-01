const express = require("express");
const router = express.Router();
const { get } = require("../../databases/mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const services = await client
      .db("EgloCloud")
      .collection("Services")
      .find({ available: true })
      .toArray()

    res.status(200).send(services)
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
