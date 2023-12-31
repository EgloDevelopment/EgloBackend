const crypto = require("crypto");

require("dotenv").config();

async function getUserIDFromToken(id) {
  const key = process.env.ENCRYPTION_KEY;

  const algorithm = "aes-256-cbc";

  const decipher = crypto.createDecipher(algorithm, key);

  let decrypted = decipher.update(id, "hex", "utf8");
  decrypted += decipher.final("utf8");

  let trimmed_id = decrypted.split("/")[1] 

  return trimmed_id
}

module.exports = { getUserIDFromToken };
