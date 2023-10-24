const validator = require("validator");

async function extractText(inputString) {
  try {
    const parsedObject = JSON.parse(inputString);
    const keys = Object.keys(parsedObject);
    return keys[0] || "";
  } catch (error) {
    return "";
  }
}

async function validateBody(body, params) {
  try {
    for (const requirement of params) {
      const requirement_name = await extractText(JSON.stringify(requirement));

      if (body.hasOwnProperty(requirement_name)) {
        if (
          typeof body[requirement_name] !== requirement[requirement_name].type
        ) {
          return {
            error: true,
            fields: [requirement_name],
            data: "Not a " + requirement[requirement_name].type,
          };
        }

        if (
          requirement[requirement_name].empty === false &&
          body[requirement_name].trim().length === 0
        ) {
          return {
            error: true,
            fields: [requirement_name],
            data: "Can not be empty",
          };
        }

        if (
            requirement[requirement_name].alphanumeric === true &&
            validator.isAlphanumeric(body[requirement_name]) === false
          ) {
            return {
              error: true,
              fields: [requirement_name],
              data: "Not alphanumeric",
            };
          }

          if (
            requirement[requirement_name].strong_password === true &&
            validator.isStrongPassword(body[requirement_name]) === false
          ) {
            return {
              error: true,
              fields: [requirement_name],
              data: "Not a strong enough password",
            };
          }

        if (
          body[requirement_name].length >
            requirement[requirement_name].max_length &&
          requirement[requirement_name].max_length !== 0
        ) {
          return {
            error: true,
            fields: [requirement_name],
            data:
              "Over " +
              requirement[requirement_name].max_length +
              " characters",
          };
        }

        

        if (
          requirement[requirement_name].empty === false &&
          requirement[requirement_name].email === true
        ) {
          if (validator.isEmail(body[requirement_name]) === false) {
            return {
              error: true,
              fields: [requirement_name],
              data: "Not a valid email",
            };
          }
        } else if (
          requirement[requirement_name].empty === true &&
          body[requirement_name].length > 0 &&
          requirement[requirement_name].email === true
        ) {
          if (validator.isEmail(body[requirement_name]) === false) {
            return {
              error: true,
              fields: [requirement_name],
              data: "Not a valid email",
            };
          }
        }

      } else {
        return {
          error: true,
          fields: [requirement_name],
          data: "Can not be empty",
        };
      }
    }
  } catch(e) {
    console.log(e)
    return {
      error: true,
      fields: [],
      data: "Error processing",
    };
  }
}

module.exports = { validateBody };
