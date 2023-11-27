"use strict";

let mongoose = require("mongoose");
let accentFold = require("../helpers/accentFold");

// Collection Name
const SERVICE_COLLECTION = "service";

// Services Schema Instance
let ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    text: true
  },
  description: {
    type: String,
    required: false
  },
  registrationDate: {
    type: String,
    required: true
  }
});

/**
 * Service Model instance using Service Collection Name, and Service Schema Instance.
 * Second Service Collection avoids collection naming in plural by Mongoose.
 */
let ServiceModel = mongoose.model(
  SERVICE_COLLECTION,
  ServiceSchema,
  SERVICE_COLLECTION
);
module.exports.ServiceModel = ServiceModel;

/**
 * create a new service data document.
 * @param  {} newService
 */
module.exports.registerService = newService => {
  return new Promise((resolve, reject) => {
    let newServiceData = new ServiceModel(newService);
    newServiceData
      .save()
      .then(service_Model => {
        return resolve(service_Model);
      })
      .catch(err => {
        return reject(err);
      });
  }).catch(err => {
    return reject(err);
  });
};

/**
 * check services by name to avoid duplicate insertions.
 * @param  {} name
 */
module.exports.checkServiceExistsByName = (
  nameToCheck,
  checkingDuplicate = false
) => {
  return new Promise((resolve, reject) => {
    ServiceModel.findOne({
      name: nameToCheck
    })
      .then((service, err) => {
        if (service) {
          return resolve(service.name);
        } else {
          return resolve(err);
        }
      })
      .catch(err => {
        console.log("err", err);
        return reject(err);
      });
  });
};

/**
 * check services by name to avoid duplicate insertions.
 * @param  {} name
 */
module.exports.autocompleteService = nameToCheck => {
  // console.log('pre accentFold', nameToCheck);
  // nameToCheck = accentFold.accent_fold(nameToCheck);

  return new Promise((resolve, reject) => {
    let valueMatch = new RegExp(nameToCheck);
    ServiceModel.find({
      name: valueMatch
    })
      .then((result, err) => {
        if (result) {
          return resolve(result);
        } else {
          return resolve(err);
        }
      })
      .catch(err => {
        return reject(err);
      });
  });
};

/**
 * Checks services by name to avoid duplicate insertions.
 * @param  {} name
 */
module.exports.getAllServices = () => {
  return new Promise((resolve, reject) => {
    ServiceModel.find({})
      .then((service, err) => {
        if (service) {
          return resolve(service);
        } else {
          return resolve(err);
        }
      })
      .catch(err => {
        return reject(err);
      });
  });
};

/**
 * Deletes a Service document.
 * @param  {} activation
 */
module.exports.deleteService = service => {
  return new Promise((resolve, reject) => {
    ServiceModel.deleteOne(
      {
        name: service
      },
      err => {
        if (err) {
          return resolve(false);
        } else {
          return resolve(true);
        }
      }
    ).catch(err => {
      return reject(err);
    });
  });
};

/**
 * Changes old service name by new service name.
 * @param  {} user is an array which contains roles assigned to User.
 */
module.exports.updatedServiceName = (oldName, newName) => {
  return new Promise((resolve, reject) => {
    ServiceModel.updateOne(
      {
        name: oldName
      },
      { $set: { name: newName } },
      () => {
        return resolve(true);
      }
    ).catch(err => {
      return reject(false);
    });
  });
};
