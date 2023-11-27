"use strict";

let express = require("express");
let moment = require("moment");
let router = express.Router();
let passport = require("passport");

const User = require("../models/User");
const Phone = require("../models/Phone");
const Email = require("../models/Email");
const Activation = require("../models/Activation");
const UserSession = require("../models/UserSession");
const Log = require("../models/Log");
const errorLogHandler = require("../middleware/errorLogHandler");
const typeUserChecker = require("../helpers/typeUserChecker");

/*  "/api/users/signup"
 *    POST: Creates a new User model according to the input data from req.body.
 */
router.post("/signUp", (req, res) => {
  try {
    // validating form data
    req.checkBody("userId", "Usuario es requerido").notEmpty();
    req
      .checkBody("userId")
      .matches("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$")
      .withMessage(
        "Formato de Usuario no es válido, debe tener un dígito, una mayúscula, y mínimo 8 caracteres de largo."
      );
    req
      .checkBody("personalId", "Número de Identificación es requerido")
      .notEmpty();
    req.checkBody("firstName", "Nombre es requerido").notEmpty();
    req.checkBody("lastName", "Apellidos son requeridos").notEmpty();
    req.checkBody("password", "Contraseña es requerida").notEmpty();
    req
      .checkBody("password")
      .matches("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).{8,}$")
      .withMessage(
        "Contraseña no es válida, debe tener un dígito, una mayúscula, un símbolo, y mínimo 8 caracteres de largo."
      );
    // req.checkBody('profileImageId', 'Profile Image Id is required').notEmpty();
    req
      .checkBody("registrationDate", "Fécha de Registro es requerido")
      .notEmpty();
    req.checkBody("active", "Active es requerido").notEmpty();
    req.checkBody("email", "Email es requerido").notEmpty();
    req.checkBody("email", "Email no es válido").isEmail();
    req
      .checkBody(
        "passwordLastChange",
        "Fécha de último cambio contraseña es requerido"
      )
      .notEmpty();
    // req.checkBody('titleName', 'Title Name value is not valid').notEmpty();
    req
      .checkBody("phoneNumber")
      .isLength({
        min: 8,
      })
      .withMessage(
        "Número de teléfono de ser de almenos 8 caracteres de largo"
      );
    req
      .checkBody("phoneNumber")
      .matches("\\d{3}[\\s]\\d{4}[\\s]\\d{4}")
      .withMessage("Número de teléfono no es valido");

    // check erros
    let errors = req.validationErrors();

    if (errors) {
      errorLogHandler.logError("SIGN_UP", errors, req.body.personalId, res);
    } else {
      let userCreated = {};
      let check_PersonalId = async () => {
        return User.getUserByPersonalId(req.body.personalId);
      };

      check_PersonalId()
        .then((user, err) => {
          if (user !== null && user !== undefined) {
            err =
              "Otro usuario ya fue registrado con este Id personal: " +
              req.body.personalId;
            throw new Error(err);
          } else {
            return User.getUserByUserID(req.body.userId);
          }
        })

        .then((user, err) => {
          if (user !== null && user !== undefined) {
            err =
              "Otro persona ya fue registrada con este Usuario: " +
              req.body.userId;
            throw new Error(err);
          } else {
            return Email.findByEmail(req.body.email);
          }
        })

        .then((user, err) => {
          if (user !== null && user !== undefined) {
            err =
              "Esta cuenta de correo ya fue registrada anteriormente: " +
              req.body.email;
            throw new Error(err);
          } else {
            return Phone.findByPhone(req.body.phoneNumber);
          }
        })

        .then((user, err) => {
          if (user !== null && user !== undefined) {
            err =
              "Este teléfono ya fue registrado anteriormente: " +
              req.body.phoneNumber;
            throw new Error(err);
          } else {
            req.body.role = ["user"];
            return User.createUser(req.body);
          }
        })

        .then((result, err) => {
          if (result == null && result == undefined) {
            err = "Este usuario NO fue registrado: " + req.body.personalId;
            throw new Error(err);
          } else {
            userCreated._id = result._id;
            userCreated.userId = result.userId;
            userCreated.personalId = result.personalId;
            userCreated.name = result.firstName;
            userCreated.lastName = result.lastName;
            userCreated.role = result.role;
            userCreated.registrationDate = moment().format("MM/DD/YYYY HH:mm");
            return Phone.createPhone({
              personalId: req.body.personalId,
              name: "Celular",
              phoneNumber: req.body.phoneNumber,
            });
          }
        })

        .then((result, err) => {
          if (result == null && result == undefined) {
            err = "Este teléfono NO fue registrado: " + req.body.phoneNumber;
            throw new Error(err);
          } else {
            userCreated.phoneNumber = result.phoneNumber;
            return Email.createEmail({
              personalId: req.body.personalId,
              email: req.body.email,
            });
          }
        })

        .then((result, err) => {
          if (result == null && result == undefined) {
            err = "Esta cuenta de correo NO fue registrada: " + req.body.email;
            throw new Error(err);
          } else {
            userCreated.email = result.email;
          }
        })

        .then(() => {
          //setting whats the domain to send the email from.
          Activation.sendEmailActivation(userCreated);
          res.status(200).json(userCreated);
        })

        .catch((error) => {
          errorLogHandler.logError("SIGN_UP", error, req.body.personalId, res);
        });
    }
  } catch (error) {
    errorLogHandler.logError("SIGN_UP", error, req.body.personalId, res);
  }
});

/*  "/api/users/signin"
 *    POST: Logged in a unlogged user..
 */
router.post("/signIn", (req, res) => {
  try {
    req.checkBody("email", "Cuenta de correo es requerida.").notEmpty();
    req.checkBody("email", "Cuenta de correo no valida.").isEmail();
    req.checkBody("password", "Contraseña es requerida").notEmpty();
    req
      .checkBody("password")
      .matches("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).{8,}$")
      .withMessage(
        "Contraseña no es válida, debe contener al menos 1 dígito, una letra mayúscula, un caracter especial, y mínimo 8 caracters de largo."
      );

    // check erros
    let errors = req.validationErrors();

    if (errors) {
      let logThisError = async () => {
        return Log.createLog({
          personalId: "USER-Anonymous",
          action: "SIGN_IN",
          registrationDate: moment().format("MM/DD/YYYY HH:mm"),
          error: errors.param + " " + errors.msg,
        });
      };
      logThisError()
        .then((result, error) => {
          result.status(200);
        })
        .catch((error) => {
          result.status(200).json(error.message);
        });
    } else {
      passport.authenticate(
        "local",
        {
          session: false,
        },
        (err, user) => {
          if (err || !user) {
            const error = "Datos Incorrectos, el Usuario no existe.";
            res.status(404).json(error);
          } else {
            req.login(
              user,
              {
                session: false,
              },
              (error) => {
                if (error) {
                  throw new Error(error);
                }
                // si el usuario está inactivo
                if (user.active === false) {
                  const error =
                    "Este usuario NO ha sido activado. Verificar si el correo de activación está en su buzón de correos.";
                  res.status(404).json(error);
                } else {
                  // cloning user obj to add properties: email and phone
                  let userObj = Object.assign({}, user);
                  let userEmail = req.body.email;
                  let personalId = "";

                  // assures that a patient or doctor sigin into their correct sites.
                  if (
                    !typeUserChecker.checkTypeUser(
                      user.role[0],
                      req.body.origin
                    )
                  ) {
                    res.status(200).json({
                      redirect: user.role[0],
                    });
                    return;
                  }

                  let findSession = async () => {
                    return UserSession.findSessionByPersonalId({
                      personalId: user.personalId,
                    });
                  };
                  findSession()
                    .then((result, err) => {
                      // if user has or has not an actived sessions:
                      // Deletes all sessions of an specific personalId
                      return UserSession.deleteSession(user.personalId);
                    })

                    .then((result, err) => {
                      if (!result) {
                        const error =
                          "Las sesiones no pudieron ser eliminadas para este usuario. Contactar Administrador";
                        throw new Error(error);
                      } else {
                        return Email.findByEmail(userEmail);
                      }
                    })

                    .then((email, err) => {
                      if (!email) {
                        const error =
                          "Esta cuenta de correo NO está registrada. " +
                          userEmail;
                        throw new Error(error);
                      } else {
                        personalId = email.personalId;
                        userObj.email = userEmail;
                        return Phone.findPhoneByPersonalId(personalId);
                      }
                    })

                    .then((phone, err) => {
                      if (!phone) {
                        const error =
                          "Este número de teléfono NO está registrado." +
                          personalId;
                        throw new Error(error);
                      } else {
                        userObj.phone = phone.phoneNumber;
                        userObj.password = "";
                        userObj.personalId = phone.personalId;

                        let add_Session = async () => {
                          return UserSession.addSession(userObj);
                        };
                        add_Session()
                          .then(
                            (newSession, err) => {
                              res.status(200).json({
                                token: newSession.token,
                              });
                            },
                            (error) => {
                              throw new Error(error);
                            }
                          )
                          .catch((error) => {
                            throw new Error(error);
                          });
                      }
                    })

                    .catch((error) => {
                      errorLogHandler.logError(
                        "SIGN_IN",
                        error,
                        req.body.email,
                        res
                      );
                    });
                }
              }
            );
          }
        }
      )(req, res);
    }
  } catch (error) {
    errorLogHandler.logError("SIGN_IN", error, "USER-Anonymous", res);
  }
});

/*  "/api/users/signout/:personalId"
 *    DELETE: Deletes all open session according to userID
 */
router.delete("/signOut", (req, res) => {
  UserSession.findSessionByPersonalId({
    personalId: req.query.personalId,
  })
    .then((data) => {
      if (!data) {
        let err = "Este usuario NO tiene sesiones activas.";

        res.status(402).json({
          error: err,
        });
      } else {
        return UserSession.deleteSession(req.query.personalId)
          .then(() => {
            let msg = "Cerradas todas las sesiones activas.";

            res.status(200).json({
              msg: msg,
            });
          })
          .catch((error) => {
            errorLogHandler.logError(
              "SIGN_OUT",
              error,
              req.query.personalId,
              res
            );
          });
      }
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({
        error: err,
      });
    });
});

/*  "/api/users/activate/verify"
 *    GET: Verifies Token send by user when clicks activation button from email
 */
router.post("/activate/verify", (req, res) => {
  Activation.findActivationToken({
    personalId: req.body.personalId,
    token: req.body.token,
  })

    .then((data) => {
      if (data == null) {
        let err =
          "Usuario previamente activado. Código de Activación No encontrado.";
        throw new Error(err);
      } else {
        // is current server's domain equals to server's domain used for the signup
        if (process.env.PROTOCOL + process.env.URL == data.host) {
          return User.isAnActiveUser(data);
        } else {
          let err =
            "Domain does NOT match. Information is from Authentic email.";
          throw new Error(err);
        }
      }
    })

    .then((user) => {
      return User.activateUser(user);
    })

    .then(() => {
      return Activation.deleteTokenByPersonalId({
        personalId: req.body.personalId,
      });
    })

    .then(() => {
      res.status(200).json({ activated: true });
    })

    .catch((error) => {
      errorLogHandler.logError(
        "ACTIVATE_VERIFY",
        error,
        req.body.personalId,
        res
      );
    });
});

/*  "/api/users/activate/resend"
 *    POST: Creates a new Token and Resends a new Activation Link.
 */
router.post("/activate/resend/", (req, res) => {
  req.checkBody("email", "Email field is required").notEmpty();
  req.checkBody("email", "Email is not valid").isEmail();

  // check erros
  let errors = req.validationErrors();

  if (errors) {
    errorLogHandler.logError(
      "ACTIVATE_RESEND",
      errors,
      req.body.personalId,
      res
    );
  } else {
    let userCreated = {};
    let check_UserEmail = async () => {
      return Email.findByEmail(req.body.email);
    };

    check_UserEmail()
      .then((userEmail, err) => {
        if (userEmail == null && userEmail == undefined) {
          err =
            "Esta cuenta de correo no ha sido registrada. Debe registrar su usuario con esta cuenta de correo.";
          throw new Error(err);
        } else {
          userCreated.email = userEmail.email;
          userCreated.personalId = userEmail.personalId;
          return Activation.findByPersonalId(userCreated.personalId);
        }
      })

      .then((userActivation, err) => {
        if (userActivation == null || userActivation == undefined) {
          err =
            "No hay una activación pendiente para esta cuenta de correo: " +
            userCreated.email;
          throw new Error(err);
        } else {
          return User.getUserByPersonalId(userCreated.personalId);
        }
      })

      .then((userData, err) => {
        if (userData == null || userData == undefined) {
          err =
            "No hay un usuario registrado con esta identificación: " +
            userCreated.personalId;
          throw new Error(err);
        } else {
          userCreated.userId = userData.userId;
          userCreated.name = userData.firstName;
          userCreated.lastName = userData.lastName;
          return Phone.findPhoneByPersonalId(userCreated.personalId);
        }
      })

      .then((userPhoneNumber, err) => {
        if (userPhoneNumber == null || userPhoneNumber == undefined) {
          err =
            "Este usuario no tiene un teléfono registrado: " +
            userCreated.personalId;
          throw new Error(err);
        } else {
          userCreated.phoneNumber = userPhoneNumber.phoneNumber;
          //setting whats the domain to send the email from.
          Activation.sendEmailActivation(userCreated);
          res.status(200).json(userCreated);
        }
      })

      .catch((error) => {
        errorLogHandler.logError(
          "SIGN_UP_ACTIVATION_RESEND",
          error,
          userCreated.personalId,
          res
        );
      });
  }
});

/*  "/api/users/getToken"
 *    POST: Creates a new Token and Send a New Token for a new Session.
 */
router.post("/getToken/", (req, res) => {
  try {
    let create_Token = async () => {
      return UserSession.createToken(req.body);
    };
    create_Token()
      .then((response, err) => {
        res.status(200).json({
          token: response,
        });
      })
      .catch((error) => {
        errorLogHandler.logError("GET_TOKEN", error, "USER-Anonymous", res);
      });
  } catch (error) {
    errorLogHandler.logError("GET_TOKEN", error, "USER-Anonymous", res);
  }
});

/* GET: Get User by Personal Id.
 * "/api/users/view/:personalId"
 */
router.get("/view/:personalId", (req, res) => {
  let userData = {};

  User.getUserByPersonalId(req.params.personalId)

    .then((response) => {
      userData = { ...response._doc };
      return Email.getUserEmailByPersonalId(userData.personalId);
    })

    .then((responseEmail, err) => {
      if (responseEmail == null && responseEmail == undefined) {
        err = "Este usuario no tiene una cuenta de correo asignada.";
        throw new Error(err);
      } else {
        userData.email = responseEmail.email;
        return Phone.findPhoneByPersonalId(userData.personalId);
      }
    })

    .then((responsePhone, err) => {
      if (responsePhone == null && responsePhone == undefined) {
        err = "Este usuario no tiene un número de teléfono asignado.";
        throw new Error(err);
      } else {
        userData.phoneNumber = `${responsePhone.phoneNumber.split(" ")[1]} ${
          responsePhone.phoneNumber.split(" ")[2]
        }`;
        res.status(200).send(userData);
      }
    })

    .catch((error) => {
      errorLogHandler.logError(
        "GET_USER_BY_PERSONAL_ID",
        error,
        req.params.personalId,
        res
      );
    });
});

/*  "/api/users/edit/:personalId"
 *   PUT: Update User Data by Personal Id
 */
router.put("/edit/:personalId", (req, res) => {
  User.updatedUser(req.params.personalId)

    .then((user, err) => {
      if (user == null || user == undefined) {
        err =
          "NO hay un Usuario con esta Identificación: " + req.params.personalId;
        throw new Error(err);
      } else {
        return Clinic.updatedClinic(req.params.name, req.body);
      }
    })

    .then((user, err) => {
      if (user == null || user == undefined) {
        err = "Usuario con Identificación: " + user + " NO fue actualizada.";
        throw new Error(err);
      } else {
        res.status(200).json({ user: req.body.name });
      }
    })

    .catch((error) => {
      errorLogHandler.logError(
        "EDIT_USER_DATA",
        error,
        req.params.personalId,
        res
      );
    });
});

module.exports = router;
