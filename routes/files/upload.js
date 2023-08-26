const express = require("express");
const router = express.Router();

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

router.post("/", (req, res) => {
  try {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      const uploadedFile = files.file[0];
      if (!uploadedFile) {
        res.json({ error: "File is invalid" });
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
