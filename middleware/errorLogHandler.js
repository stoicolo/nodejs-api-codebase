let moment = require("moment");
const Log = require("../models/Log");

module.exports.logError = (action, error, personalId, res) => {
  let errorMsg = "";
  if (Array.isArray(error)) {
    error.forEach((error) => {
      errorMsg = `${error.msg}`;
    });
  } else {
    errorMsg = error.message;
  }
  let logThisError = async () => {
    return await Log.createLog({
      personalId: personalId,
      action: action,
      registrationDate: moment().format("MM/DD/YYYY HH:mm"),
      error: errorMsg,
    });
  };

  logThisError()
    .then(() => {
      res.status(200).json(errorMsg);
    })
    .catch((error) => {
      res.status(500).json(error.message);
    });
};
