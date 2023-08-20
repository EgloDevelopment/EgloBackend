const express = require("express");
const router = express.Router();

require("dotenv").config();

router.post("/", (req, res) => {
  try {
    res.sendFile(req.body.file_id + "." + req.body.extension, {
      root: "./files/",
    });
  } catch (e) {
    console.error(e);
    res.json({ error: "Failed to download" });
  }
});

module.exports = router;
