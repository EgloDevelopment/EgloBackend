const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

async function encryptUserID(id) {
  const key = process.env.ENCRYPTION_KEY;

  const algorithm = "aes-256-cbc";

  const cipher = crypto.createCipher(algorithm, key);

  let random_string_1 = uuidv4()
  let random_string_2 = uuidv4()

  let full_string = `${random_string_1}/${id}/${random_string_2}`

  console.log(full_string)

  let encrypted = cipher.update(full_string, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted
}

module.exports = { encryptUserID }
