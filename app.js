"use strict";

let express = require("express");
// let path = require("path"); // to take care of file paths
let passport = require("passport");
let session = require("express-session");
let mongoose = require("mongoose");

require("dotenv").config();

// Load Middleware
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const expressValidator = require("./middleware/expressValidator");
const corsConfig = require("./middleware/corsConfig");
require("./middleware/passport")(passport);

// nogger config
let logParams = {
  consoleOutput: true,
  consoleOutputLevel: ["DEBUG", "ERROR", "WARNING"],

  dateTimeFormat: "DD-MM-YYYY HH:mm:ss.S",
  outputPath: "public/logs/",
  fileNameDateFormat: "DDMMYYYY",
  fileNamePrefix: "log-edocalo-",
};
let log = require("noogger").init(logParams);

// Init App
let app = express();

//allow OPTIONS on all resources
app.options("*", cors(corsConfig));

app.use(cors(corsConfig));
app.use(errorHandler);
app.use(expressValidator);
// app.use(passport.initialize()); // Load Passport Config and Init Passport Middleware
// app.use(passport.session());

// BodyParser MIDDELWARE
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Handle session
app.use(
  session({
    secret: "edocalo costarica",
    saveUninitialized: true,
    resave: true,
  })
);

// Routes
app.use("/api/tools", require("./routes/tools"));
app.use("/api/users", require("./routes/users"));

// Database Connection
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    useCreateIndex: true,
  })
  .then(() => console.log("Conectado a MongoDB", process.env.DB_URI))
  .catch((err) => console.error("Error de conexión a MongoDB:", err));

let conn = mongoose.connection;

process.on("error", (err) => {
  console.error.bind("connection error:" + err);
  logger(err, "error");
});
process.once("open", () => {
  console.log("Connected to adatabase", process.env.DB_URI);
});
process.on("exit", (code) => {
  console.log(`About to exit with code: ${code}`);
  // process.disconnect();
  process.abort();
});
conn
  .then((data) => {
    logger(data, "info");
  })
  .catch((err) => {
    logger(err, "emergency");
  });

// manages log files
function logger(error, type) {
  switch (type) {
    case "emergency":
      log.emergency(error);
      process.exit(0);
      break;
    case "alert":
      log.alert(error);
      process.exit(0);
      break;
    case "critical":
      log.critical(error);
      process.exit(0);
      break;
    case "error":
      log.error(error);
      break;
    case "warning":
      log.warning(error);
      break;
    case "notice":
      // log.notice(error);
      break;
    case "info":
      // log.info(error);
      break;
    case "debug":
      // log.debug(error);
      break;
    default:
      break;
  }
}

// module.exports = app;
const port = process.env.PORT || 3007;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
