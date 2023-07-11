const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const server_array = [];

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    for (const val of database_interaction.servers) {
      let server = await client
        .db("EgloCloud")
        .collection("Servers")
        .findOne({ id: val.id });

      server_array.push({ name: server.name, id: server.id, channels: server.channels });
    }

    res.json(server_array);
  } catch(e) {
    console.log(e)
    res.json({ error: "Failed to get user data" });
  }
});

module.exports = router;
