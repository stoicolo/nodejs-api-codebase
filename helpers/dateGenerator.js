/**
 *  Generates registration date and time value to be assign into today variable.
 */
module.exports.getDate = () => {
  const now = new Date();
  let dd = String(now.getDate());
  let mm = String(now.getMonth() + 1); // January is 0
  const yyyy = now.getFullYear();
  const hour = now.getHours();
  const minute = now.getMinutes();
  if (Number(dd) < 10) {
    dd = '0' + dd;
  }
  if (Number(mm) < 10) {
    mm = '0' + mm;
  }
  return mm + '/' + dd + '/' + yyyy + ' ' + hour + ':' + minute;
}