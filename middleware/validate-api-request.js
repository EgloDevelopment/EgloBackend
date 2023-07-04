require("dotenv").config();

const validateApiRequest = function (req, res, next) {
  try {
    let user = req.useragent;

    function getBasePath(url) {
      let result = url.substring(0, url.lastIndexOf("/"));
      return result;
    }

    if (user.isBot === false) {
      if (getBasePath(req.originalUrl) === "/auth") {
        next();
      } else {
        if (req.cookies.token && req.cookies.username && req.cookies.id) {
          next();
        } else {
          res.send("UNAUTHORIZED");
        }
      }
    } else {
      res.send("UNAUTHORIZED");
    }
  } catch (e) {
    res.send("INTERNAL SERVER ERROR");
  }
};

module.exports = validateApiRequest;
