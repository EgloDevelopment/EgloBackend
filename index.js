const express = require("express");
const app = express();
const mongodb_init = require(__dirname + "/databases/mongodb");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const useragent = require("express-useragent");
const magic = require("express-routemagic");

app.use(bodyParser.json({ limit: "5gb" }));
app.use(bodyParser.urlencoded({ limit: "5gb", extended: true }));

app.use(mongoSanitize());
app.use(cors());
app.use(cookieParser());
app.use(useragent.express());

magic.use(app);

mongodb_init();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.listen(5000, () => {
  console.log(`EgloBackend listening on port 5000`);
});
