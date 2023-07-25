const express = require("express");
const app = express();
const http = require("http");
const mongodb_init = require(__dirname + "/mongodb");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const validateApiRequest = require("./middleware/validate-api-request.js")
const useragent = require('express-useragent');
const logResponseTime = require("./middleware/log-response-time")

const server = http.createServer(app);
const setupWebSocket = require(__dirname + "/routes/data/realtime");
setupWebSocket(server, app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(mongoSanitize());
app.use(cors());
app.use(cookieParser());
app.use(useragent.express());
app.use(validateApiRequest)
app.use(logResponseTime)

mongodb_init();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const magic = require("express-routemagic");
magic.use(app);

server.listen(40002, () => {
  console.log(`Eglo API listening on port 40002`);
});