"use strict";

let express = require("express");
let moment = require("moment");
let router = express.Router();

const ServiceModel = require("../models/Service");
const LegalModel = require("../models/legalAgreement");
const Log = require("../models/Log");

// Generic error handler used by all endpoints.
let errorHandler = (title, err) => {
  console.log("\n" + title + " - " + err);
};

/* Creates a new Service document according to the input data from req.body.
 * "/api/service/register"
 */
router.post("/service/register", (req, res) => {
  try {
    // validating form data
    req.checkBody("personalId", "User Pass Id field is required").notEmpty();
    req.checkBody("name", "Name check field is required").notEmpty();
    req
      .checkBody("registrationDate", "Registration Date field is required")
      .notEmpty();

    // check erros
    let errors = req.validationErrors();

    // // check errors
    // let errors = null;
    // req.body.filter(field => {
    //   if (field.personalId === undefined || field.personalId === '') {
    //     errors.msg = 'User personal Id field is required';
    //   }
    //   if (field.name === undefined || field.name === '') {
    //     errors.msg = 'Service name is required';
    //   }
    //   if (field.registrationDate === undefined || field.registrationDate === '') {
    //     errors.msg = 'Registration Date field is required';
    //   }
    // });

    if (errors) {
      let logThisError = async () => {
        return Log.createLog({
          personalId: req.body[0]["personalId"],
          action: "SERVICE_REGISTER",
          registrationDate: moment().format("MM/DD/YYYY HH:mm"),
          error: errors.msg,
        });
      };
      logThisError()
        .then((res) => {
          res.status(200);
        })
        .catch((err) => {
          res.status(200).json(err.message);
        });
    } else {
      let checkService = async () => {
        return ServiceModel.checkServiceExistsByName(req.body.name, true);
      };
      checkService()
        // let promisesArray = [];

        // let servicePromises = req.body.map( (service) => {
        //   return ServiceModel.checkServiceExistsByName(service.name, true)
        //     .then((aPromise) => {
        //       promisesArray.unshift(aPromise);
        //     });
        // });

        // Promise.all(servicePromises)
        //   .then(() => {
        //     return promisesArray;
        //   })
        .then((service, err) => {
          // if there is a registered service
          if (service) {
            err =
              "Ya existe un servicio registrado con este nombre: " + service;
            errorHandler("ServiceModel.getServiceByName: ", err);
            throw new Error(err);
          } else {
            return ServiceModel.registerService(req.body);

            // req.body.forEach(service => {
            //   return ServiceModel.registerService(service);
            // });
          }
          // // if there is a registered service
          // if (!service.includes(null) && !service.includes(undefined)) {
          //   err = "Ya existe un servicio registrado con este nombre: " + service;
          //   errorHandler('ServiceModel.getServiceByName: ', err);
          //   throw new Error(err);

          // } else {
          //   req.body.forEach(service => {
          //     return ServiceModel.registerService(service);
          //   });

          // }
        })
        .then((result, err) => {
          if (!result) {
            err = "Servicio(s) no agregado(s): " + req.body.name;
            errorHandler("ServiceModel.registerService: ", err);
            throw new Error(err);
          } else {
            res.status(200).json(result);
          }
        })
        .catch((err) => {
          let logThisError = async () => {
            return Log.createLog({
              name: req.body.name,
              action: "SERVICE_REGISTER",
              registrationDate: moment().format("MM/DD/YYYY HH:mm"),
              error: err.message,
            });
          };
          logThisError()
            .then(() => {})
            .catch((err) => {});
          res.status(200).json(err.message);
        });
    }
  } catch (error) {
    console.log(error);
  }
});

/* Logged out a logged in user.
 * "/api/tools/service/list"
 */
router.get("/service/list", (req, res) => {
  ServiceModel.getAllServices()
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(501).redirect(`${process.env.PROTOCOL}${process.env.FE_URL}`);
    });
});

/* Search for services according to condition
 * "/api/tools/service/list"
 */
router.post("/service/:name", (req, res) => {
  ServiceModel.autocompleteService(req.body.searchText)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(501).redirect(`${process.env.PROTOCOL}${process.env.FE_URL}`);
    });
});

/*  "/api/service/delete/:service"
 *    DELETE: Deletes a service according to service name
 */
router.delete("/service/delete/:service", (req, res) => {
  ServiceModel.checkServiceExistsByName(req.params.service)
    .then((service, err) => {
      if (service == null || service == undefined) {
        err = "NO hay un servicio: " + req.params.service;
        errorHandler("ServiceModel.checkServiceExistsByName: ", err);
        throw new Error(err);
      } else {
        return ServiceModel.deleteService(service);
      }
    })
    .then((service, err) => {
      if (service == null || service == undefined) {
        err = "Servicio " + service + " NO fue eleminado.";
        errorHandler("ServiceModel.deleteService: ", err);
        throw new Error(err);
      } else {
        res.status(200).json({ service: req.params.service });
      }
    })
    .catch((err) => {
      let logThisError = async () => {
        return Log.createLog({
          personalId: req.body.personalId,
          action: "SERVICE_DELETE",
          registrationDate: moment().format("MM/DD/YYYY HH:mm"),
          error: err.msg,
        });
      };
      logThisError()
        .then(() => {})
        .catch((err) => {});
      res.status(200).json(err.message);
    });
});

/*  "/api/service/delete/:service"
 *    UPDATE: Updates a service name according to new service name
 */
router.put("/service/update/:oldService/:newService", (req, res) => {
  console.log("req.params.oldService", req.params.oldService);
  ServiceModel.checkServiceExistsByName(req.params.oldService, true)
    .then((service, err) => {
      if (service == null || service == undefined) {
        err = "NO hay un servicio: " + req.params.oldService;
        errorHandler("ServiceModel.checkServiceExistsByName: ", err);
        throw new Error(err);
      } else {
        return ServiceModel.updatedServiceName(
          req.params.oldService,
          req.params.newService
        );
      }
    })
    .then((service, err) => {
      if (service == null || service == undefined) {
        err = "Servicio " + service + " NO fue actualizado.";
        errorHandler("ServiceModel.updateServiceName: ", err);
        throw new Error(err);
      } else {
        res.status(200).json({ service: req.params.newService });
      }
    })
    .catch((err) => {
      let logThisError = async () => {
        return Log.createLog({
          personalId: req.body.service,
          action: "SERVICE_UPDATE",
          registrationDate: moment().format("MM/DD/YYYY HH:mm"),
          error: err.msg,
        });
      };
      logThisError()
        .then(() => {})
        .catch((err) => {});
      res.status(200).json(err.message);
    });
});

/*  "/api/legal/last"
 *    POST:
 */
router.post("/legal/last", (req, res) => {
  LegalModel.getLastLegalIdByType({
    type: req.body.type,
  })
    .then((legalId) => {
      if (legalId == null || legalId == undefined) {
        res.status(200).json({ legalId: 0 });
      } else {
        res.status(200).json({ legalId: legalId });
      }
    })
    .catch((err) => {
      let logThisError = async () => {
        return Log.createLog({
          personalId: req.body.personalId,
          action: "LEGAL_GETLAST",
          registrationDate: moment().format("MM/DD/YYYY HH:mm"),
          error: err.msg,
        });
      };
      logThisError()
        .then(() => {})
        .catch((err) => {});
      res.status(200).json(err.message);
    });
});

/* Creates a new Service document according to the input data from req.body.
 * "/api/service/register"
 */
router.post("/legal/register", (req, res) => {
  try {
    console.log("legal body", req.body);

    // validating form data
    req.checkBody("type", "Legal Type field is required").notEmpty();
    req
      .checkBody("legalAgreementId", "Legal Agreement check field is required")
      .notEmpty();
    req
      .checkBody(
        "registerPersonalId",
        "Register Personal Id check field is required"
      )
      .notEmpty();
    req.checkBody("description", "Description field is required").notEmpty();
    req.checkBody("active", "Active field must be boolean").isBoolean();
    req.checkBody("releaseDate", "Release Date field is string").isString();
    req
      .checkBody("registrationDate", "Registration Date field is required")
      .notEmpty();

    // check erros
    let errors = req.validationErrors();

    if (errors) {
      let logThisError = async () => {
        return Log.createLog({
          personalId: req.body.registerPersonalId,
          action: "LEGAL_REGISTER",
          registrationDate: moment().format("MM/DD/YYYY HH:mm"),
          error: errors.msg,
        });
      };
      logThisError()
        .then((res) => {
          res.status(200);
        })
        .catch((err) => {
          res.status(200).json(err.message);
        });
    } else {
      let registerLegal = async () => {
        return LegalModel.registerLegal(req.body);
      };
      registerLegal()
        .then((result, err) => {
          if (result === undefined) {
            err = "Contrato Legal NO agregado: " + req.body.legalAgreementId;
            errorHandler("LegalModel.registerLegal: ", err);
            throw new Error(err);
          } else {
            res.status(200).json(req.body);
          }
        })
        .catch((err) => {
          let logThisError = async () => {
            return Log.createLog({
              personalId: req.body.registerPersonalId,
              action: "LEGAL_REGISTER",
              registrationDate: moment().format("MM/DD/YYYY HH:mm"),
              error: errors.msg,
            });
          };
          logThisError()
            .then(() => {})
            .catch((err) => {});
          res.status(200).json(err.message);
        });
    }
  } catch (error) {
    console.log(error);
  }
});

/* Get all legals agreements documents
 * "/api/tools/legal/list"
 */
router.get("/legal/list", (req, res) => {
  LegalModel.getAllLegals()
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(501).redirect(`${process.env.PROTOCOL}${process.env.FE_URL}`);
    });
});

/* Get a legal agreement document by Id
 * "/api/tools/legal/:id"
 */
router.get("/legal/:id", (req, res) => {
  LegalModel.checkLegalExistsById(req.params.id)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(501).redirect(`${process.env.PROTOCOL}${process.env.FE_URL}`);
    });
});

/* Get activated legal agreement by type
 * "/api/tools/activated/:type"
 */
router.get("/legal/activated/:type", (req, res) => {
  LegalModel.checkActivatedLegalByType(req.params.type)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(501).redirect(`${process.env.PROTOCOL}${process.env.FE_URL}`);
    });
});

/*  "/api/legal/delete/:service"
 *    DELETE: Deletes a service according to service name
 */
router.delete("/legal/delete/:id", (req, res) => {
  LegalModel.checkLegalExistsById(req.params.id)
    .then((legal, err) => {
      if (legal == null || legal == undefined) {
        err = "NO hay un contrato legal: " + req.params.id;
        errorHandler("LegalModel.checkLegalExistsById: ", err);
        throw new Error(err);
      } else {
        return LegalModel.deleteLegal(legal.legalAgreementId);
      }
    })
    .then((legal, err) => {
      if (!legal) {
        err = "Contrato Legal " + req.params.id + " NO fue eleminado.";
        errorHandler("LegalModel.deleteService: ", err);
        throw new Error(err);
      } else {
        res.status(200).json({ legal: req.params.id });
      }
    })
    .catch((err) => {
      let logThisError = async () => {
        return Log.createLog({
          personalId: req.body.personalId,
          action: "LEGAL_DELETE",
          registrationDate: moment().format("MM/DD/YYYY HH:mm"),
          error: err.msg,
        });
      };
      logThisError()
        .then(() => {})
        .catch((err) => {});
      res.status(200).json(err.message);
    });
});

/*  "/api/legal/delete/"
 *    UPDATE: Updates a legal document according to new Legal obj
 */
router.put("/legal/update", (req, res) => {
  LegalModel.checkLegalExistsById(req.body.legalAgreementId)
    .then((legal, err) => {
      if (legal == null || legal == undefined) {
        err = "NO hay un contrato legal: " + req.body.legalAgreementId;
        errorHandler("LegalModel.checkLegalExistsById: ", err);
        throw new Error(err);
      } else {
        return LegalModel.updatedLegal(req.body);
      }
    })
    .then((legal, err) => {
      if (!legal) {
        err =
          "Contrato Legal " +
          req.body.legalAgreementId +
          " NO fue actualizado.";
        errorHandler("LegalModel.updatedLegal: ", err);
        throw new Error(err);
      } else {
        res.status(200).json({ legal: req.body.legalAgreementId });
      }
    })
    .catch((err) => {
      let logThisError = async () => {
        return Log.createLog({
          personalId: req.body.registerPersonalId,
          action: "LEGAL_UPDATE",
          registrationDate: moment().format("MM/DD/YYYY HH:mm"),
          error: err.msg,
        });
      };
      logThisError()
        .then(() => {})
        .catch((err) => {});
      res.status(200).json(err.message);
    });
});

module.exports = router;
