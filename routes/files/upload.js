const express = require("express");
const router = express.Router();
const { get } = require("../../mongodb");

require("dotenv").config();

const formidable = require("formidable");
const { v4: uuidv4 } = require("uuid");
const Minio = require("minio");

var minioClient = new Minio.Client({
  endPoint: process.env.MINIO_URL,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESSKEY,
  secretKey: process.env.MINIO_SECRETKEY,
});

router.post("/", async (req, res) => {
  try {
    const client = get();

    const database_interaction = await client
      .db("EgloCloud")
      .collection("Users")
      .findOne({ token: req.cookies.token });

    var max_size = 0;

    if (database_interaction.subscription === "free") {
      max_size = 31457280;
    }

    if (database_interaction.subscription === "personal") {
      max_size = 1073741824;
    }

    if (database_interaction.subscription === "enterprise") {
      max_size = 5368709120;
    }

    var form = new formidable.IncomingForm({
      maxFileSize: 5 * 1024 * 1024 * 1024,
    });

    form.parse(req, function (err, fields, files) {
      const uploadedFile = files.file[0];
      if (!uploadedFile) {
        res.json({ error: "File is invalid" });
        return;
      }

      if (uploadedFile.size > max_size) {
        res.json({ error: "File is too large, upgrade your plan" });
        return;
      }

      let id = uuidv4();

      let extension = uploadedFile.originalFilename.split(".").pop();

      const oldpath = uploadedFile.filepath;

      minioClient.fPutObject("user-storage", id + "." + extension, oldpath);

      res.json({ success: true, id: id, name: uploadedFile.originalFilename });
    });
  } catch (e) {
    console.error(e);
    res.json({ error: "Failed to upload" });
  }
});

module.exports = router;
