/**
 *  Generates registration date and time value to be assign into hourRange variable.
 */
module.exports.generateSchedule = (openHour, closeHour) => {
  const openTime =  openHour.split(':');
  const closeTime =  closeHour.split(':');
  let agendaSchedule = [];
  let firstRound = true;

  for (let hour = openTime[0]; hour <= closeTime[0]; hour++) {
    let openMinute = +openTime[1];

    hour = (+hour < 10) ? `0${+hour}` : hour; // add zero in front those numbers less than 10
    if(!firstRound) {
      agendaSchedule.push(`${hour}-00`);
      openMinute += 15;
    }
    if (firstRound && (openMinute >= 0 && openMinute <= 15)) {
      firstRound = false;
      agendaSchedule.push(`${hour}-00`);
      if(+hour !== +closeTime[0]) {
        openMinute += 15;
      }
    }
    if(+hour === +closeTime[0] && (closeTime[1] >= 0 && closeTime[1] <= 15)) {
      break;
    }
    if(!firstRound) {
      agendaSchedule.push(`${hour}-15`);
      openMinute += 15;
    }
    if (firstRound && (openMinute > 15 && openMinute <= 30)) {
      firstRound = false;
      agendaSchedule.push(`${hour}-15`);
      if(+hour !== +closeTime[0]) {
        openMinute += 15;
      }
    }
    if(+hour === +closeTime[0] && (closeTime[1] > 15 && closeTime[1] <= 30)) {
      break;
    }

    if(!firstRound) {
      agendaSchedule.push(`${hour}-30`);
      openMinute += 15;
    }
    if (firstRound && (openMinute > 30 && openMinute <= 45)) {
      firstRound = false;
      agendaSchedule.push(`${hour}-30`);
      if(+hour !== +closeTime[0]) {
        openMinute += 15;
      }
    }
    if(+hour === +closeTime[0] && (+closeTime[1] > 30 && +closeTime[1] <= 45)) {
      break;
    }

    if(!firstRound) {
      agendaSchedule.push(`${hour}-45`);
      openMinute += 15;
    }
    if (firstRound && (openMinute > 45 && openMinute <= 59)) {
      firstRound = false;
      agendaSchedule.push(`${hour}-45`);
      if(+hour !== +closeTime[0]) {
        openMinute += 15;
      }
    }
    if(+hour === +closeTime[0] && (+closeTime[1] > 45 && +closeTime[1] <= 59)) {
      break;
    }
  }
  return agendaSchedule;
}
