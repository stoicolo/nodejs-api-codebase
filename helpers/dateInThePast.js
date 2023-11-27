let moment = require("moment");

module.exports.isDateInThePast = (dateToCheck, today) => {
  dateToCheck = moment(dateToCheck, "MM/DD/YYYY HH:mm");
  today = moment(today, "MM/DD/YYYY HH:mm");
  return moment(dateToCheck).isBefore(today);
};
