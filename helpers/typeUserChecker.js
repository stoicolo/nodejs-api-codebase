/**
 *  Generates registration date and time value to be assign into today variable.
 */
module.exports.checkTypeUser = (userType, origin) => {
  try {
    if (userType === "patient" || userType === "doctor") {
      return origin.includes(userType);
    }
    return true;
  } catch (error) { 
    return false;
  }
}