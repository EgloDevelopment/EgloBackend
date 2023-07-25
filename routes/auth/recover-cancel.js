const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const validator = require("validator");
const { v4: uuidv4 } = require("uuid");

router.post("/", async (req, res) => {
  try {
    const client = get();

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ id: req.body.id });
    if (database_interaction !== null) {
      if (
        database_interaction.recovery_email &&
        database_interaction.recoverable === true &&
        req.body.code === database_interaction.recovery_code
      ) {
        await client
          .db("EgloCloud")
          .collection("Users")
          .updateOne(
            { id: req.body.id },
            {
              $set: { recoverable: false, recovery_code: "" },
            }
          );

        res.json({ success: true });
      } else {
        res.json({ error: "Unauthorized" });
      }
    } else {
      res.json({ error: "Unauthorized" });
    }
  } catch (e) {
    console.log(e);
    res.json({ error: "Internal server error" });
  }
});

module.exports = router;
