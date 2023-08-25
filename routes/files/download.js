const express = require("express");
const router = express.Router();

require("dotenv").config();

const Minio = require("minio");

var minioClient = new Minio.Client({
  endPoint: "minio.eglo.pw",
  useSSL: true,
  accessKey: process.env.MINIO_ACCESSKEY,
  secretKey: process.env.MINIO_SECRETKEY,
});

router.post("/", (req, res) => {
  try {
    const id = req.body.file_id;
    const extension = req.body.extension;
    const filename = id + "." + extension;

    minioClient.getObject("user-storage", filename, function (err, stream) {
      if (err) {
        console.error(err);
        return res.json({ error: "File not found" });
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      stream.pipe(res);
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to download" });
  }
});

module.exports = router;
