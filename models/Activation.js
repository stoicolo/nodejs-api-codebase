"use strict";

let dateGenarator = require("../helpers/dateGenerator");
let emailerModule = require("../helpers/emailer");
let mongoose = require("mongoose");

const UserSession = require("./UserSession");
const ACTIVATION_COLLECTION = "activation";

// Tokens list Schema
const ACTIVATION_SCHEMA = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  host: {
    type: String,
    required: true,
  },
  registrationDate: {
    type: String,
    required: true,
  },
  personalId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

let activationModel = mongoose.model(
  ACTIVATION_COLLECTION,
  ACTIVATION_SCHEMA,
  ACTIVATION_COLLECTION
);
module.exports.activationModel = activationModel;

/**
 * Creates a new Activation Token and register this document in Activation collection.
 * @param  {} newActivation
 */
module.exports.createActivation = (newActivation) => {
  return new Promise((resolve, reject) => {
    let create_Token = async () => {
      return UserSession.createToken(newActivation);
    };
    create_Token()
      .then((response) => {
        const newToken = response;
        let today = dateGenarator.getDate();
        let newActivationData = new activationModel({
          token: newToken,
          host: process.env.PROTOCOL + process.env.URL,
          registrationDate: today,
          personalId: newActivation.personalId,
          email: newActivation.email,
        });

        console.log("host", process.env.PROTOCOL + process.env.URL);

        newActivationData
          .save()
          .then((activationModel) => {
            return resolve(activationModel);
          })
          .catch((err) => {
            console.log("\nThis Activation was not register. ", err);
            return reject(err);
          });
      })
      .catch((err) => {
        console.log("\nerror", err);
        res.json({
          error: err,
        });
      });
  });
};

/**
 * Find user activations by personal Id.
 * @param  {} activation
 */
module.exports.findByPersonalId = (activation) => {
  return new Promise((resolve, reject) => {
    activationModel
      .findOne({
        personalId: activation,
      })
      .then((user, err) => {
        if (user !== null) {
          return resolve(user);
        } else {
          return resolve(err);
        }
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

/**
 * Finds a specific Token. It is use to verify Activation Email of a User.
 * activation parameter contains an single-property object, its property name is token.
 * @param  {} activation
 */
module.exports.findActivationToken = (activation) => {
  return new Promise((resolve, reject) => {
    activationModel
      .findOne({
        personalId: activation.personalId,
        token: activation.token,
      })
      .then((user, err) => {
        if (user !== null) {
          return resolve(user);
        } else {
          return resolve(err);
        }
      })
      .catch((err) => {
        console.log("\nfindByToken catched. Reason: ", err);
        return reject(err);
      });
  });
};

/**
 * Deletes all activation documents related to a specific personalId.
 * personalId is within activation paramenter of type object.
 * @param  {} activation
 */
module.exports.deleteTokenByPersonalId = (activation) => {
  return new Promise((resolve, reject) => {
    activationModel
      .deleteMany(
        {
          personalId: activation.personalId,
        },
        (err) => {
          if (err) {
            return resolve(false);
          } else {
            return resolve(true);
          }
        }
      )
      .catch((err) => {
        return reject(err);
      });
  });
};

/**
 * Creates a new activation token to send via email using email of user.
 * Get all data via parameter using emailData for new email.
 * @param  {} emailData
 */
module.exports.sendEmailActivation = (emailData) => {
  this.createActivation(emailData)
    .then((data, error) => {
      const link = `${process.env.ACTIVATION_URL}${data.token}`;
      console.log("link: ", link);
      const output = `
        <p>Bienvenido ${emailData.name}!</p>
        <p>Hemos recibido su información personal satisfactoriamente. Por favor confirmar su deseo de ser parte de Edocalo seleccionado el siguiente boton con un click:</p>
        <table style="margin:0 auto;">
          <tr>
              <td style="background-color: rgb(18,126,177);border-radius: 5px;padding: 10px;text-align: center;">
                  <a style="display: block;color: #ffffff;font-size: 12px;text-decoration: none;text-transform: uppercase;" target="_blank" href="${link}">
                  Activar Usuario</a>
              </td>
          </tr>
        </table>
        <h3>Datos registrados en Edocalo:</h3>
        <ul>
            <li>Nombre: ${emailData.name} ${emailData.lastName}</li>
            <li>Usuario: ${emailData.userId}</li>
            <li>Cédula: ${emailData.personalId}</li>
            <li>Email: ${emailData.email}</li>
            <li>Teléfono Celular: ${emailData.phoneNumber}</li>
        </ul>
        <p>Si desea modificar algun dato personal porfavor hacerlo por medio de la aplicación Edocalo. \nAdemás, si desea saber más o reportar algun problema por favor utilizar el siguiente enlace: <a href='https://edocalo.com' target="_blank" style="">Edocalo</a></p>
        `;

      // setup email data with unicode symbols
      let mailOptions = {
        from: '"Softstoic Soluciones" <contacto@edocalo.com>', // sender address
        to: emailData.email, // list of receivers
        subject: "Bienvenido a Edocalo", // Subject line
        text: `hola ${emailData.name}!, te escribo desde Edocalo.`, // plain text body
        html: output, // html body
      };

      emailerModule.sendEmail(mailOptions, (error) => {
        if (error) {
          console.log("\nMessage was NOT send", error);
        }
      });
    })
    .catch((err) => {
      console.log("\nYour Activation Email could not be send. ", err);
      return false;
    });
};
