"use strict";

const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: process.env.OFFICE_365_HOST,
  port: process.env.OFFICE_365_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.OFFICE_365_ACCOUNT_EMAIL, // sender user email
    pass: process.env.OFFICE_365_ACCOUNT_PASSWORD, // email password
  },
  tls: {
    rejectUnauthorized: true,
  },
});

// Resto del código para enviar el correo electrónico...
function sendEmail(mailOptions) {
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.log("\nMessage was NOT send", error);
    }
  });
}

module.exports = {
  sendEmail: sendEmail,
};
