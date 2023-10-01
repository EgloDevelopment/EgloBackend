const crypto = require("crypto");

require("dotenv").config();

async function encryptUserID(id) {
  const key = process.env.ENCRYPTION_KEY;

  const algorithm = "aes-256-cbc";

  const cipher = crypto.createCipher(algorithm, key);

  let encrypted = cipher.update(id, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted
}

module.exports = { encryptUserID }
