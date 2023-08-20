const express = require("express");
const router = express.Router();

require("dotenv").config();

const fs = require("fs");
const formidable = require("formidable");
const { v4: uuidv4 } = require("uuid");

router.post("/", (req, res) => {
  try {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      const uploadedFile = files.file[0];
      if (!uploadedFile) {
        res.json({ error: "File is invalid" });
        return
      }

      let id = uuidv4()
 
      let extension = uploadedFile.originalFilename.split('.').pop();

      const oldpath = uploadedFile.filepath;
      const newpath = "./files/" + id + "." +extension;

      fs.rename(oldpath, newpath, function (renameErr) {
        res.json({ success: true, id: id, name: uploadedFile.originalFilename });
      });
    });
  } catch (e) {
    console.error(e);
    res.json({ error: "Failed to upload" });
  }
});

module.exports = router;
