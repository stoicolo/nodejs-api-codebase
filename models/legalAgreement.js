"use strict";

let mongoose = require("mongoose");

// Collection Name
const LEGAL_AGREEMENT_COLLECTION = "legalAgreement";

// Legal Agreements Schema
const LEGAL_AGREEMENT_SCHEMA = new mongoose.Schema({
  registerPersonalId: {
    type: String,
    required: true
  },
  lastModifierPersonalId: {
    type: String,
    required: false
  },
  legalAgreementId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    required: true
  },
  releaseDate: {
    type: String,
    required: false
  },
  registrationDate: {
    type: String,
    required: true
  }
});

/**
 * Legal Model instance using Legal Collection Name, and Legal Schema Instance.
 * Second Legal Collection avoids collection naming in plural by Mongoose.
 */
let legalModel = mongoose.model(
  LEGAL_AGREEMENT_COLLECTION,
  LEGAL_AGREEMENT_SCHEMA
);
module.exports.LegalModel = legalModel;

/**
 * create a new legal data document.
 * @param  {} newLegal
 */
module.exports.registerLegal = newLegal => {
  return new Promise((resolve, reject) => {
    let newLegalData = new legalModel(newLegal);
    newLegalData
      .save()
      .then(legal_Model => {
        resolve(legal_Model);
      })
      .catch(err => {
        reject(err);
      });
  }).catch(err => {
    return reject(err);
  });
};

/**
 * get last legal to get id and generate a new legal id using information of the one found in this query.
 * @param  {} name
 */
module.exports.getLastLegalIdByType = legalType => {
  return new Promise((resolve, reject) => {
    legalModel
      .find({
        type: legalType.type
      })
      .sort({ _id: -1 })
      .limit(1)
      .then((legal, err) => {
        if (legal) {
          if (legal.length > 0) {
            return resolve(legal[0].legalAgreementId);
          } else {
            return resolve(0);
          }
        } else {
          return resolve(err);
        }
      })
      .catch(err => {
        console.log("legal error", error);
        return reject(err);
      });
  });
};

/**
 * Checks legals by id
 * @param  {} name
 */
module.exports.checkLegalExistsById = id => {
  return new Promise((resolve, reject) => {
    legalModel
      .findOne({
        legalAgreementId: id
      })
      .then((legal, err) => {
        if (legal) {
          return resolve(legal);
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
 * Checks activated legal by type
 * @param  {} name
 */
module.exports.checkActivatedLegalByType = type => {
  return new Promise((resolve, reject) => {
    legalModel
      .findOne({
        type: type,
        active: true
      })
      .then((legal, err) => {
        if (legal) {
          return resolve(legal);
        } else {
          return reject(err);
        }
      })
      .catch(err => {
        return reject(err);
      });
  });
};

/**
 * Checks legals
 * @param  {} name
 */
module.exports.getAllLegals = () => {
  return new Promise((resolve, reject) => {
    legalModel
      .find({})
      .then((legal, err) => {
        if (legal) {
          return resolve(legal);
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
 * Deletes a Legal document.
 * @param  {} activation
 */
module.exports.deleteLegal = legal => {
  return new Promise((resolve, reject) => {
    legalModel
      .deleteOne(
        {
          legalAgreementId: legal
        },
        err => {
          if (err) {
            return resolve(false);
          } else {
            return resolve(true);
          }
        }
      )
      .catch(err => {
        return reject(err);
      });
  });
};

/**
 * Changes old legal name by new legal name.
 * @param  {} user is an array which contains roles assigned to User.
 */
module.exports.updatedLegal = newLegal => {
  return new Promise((resolve, reject) => {
    legalModel
      .updateOne(
        {
          legalAgreementId: newLegal.legalAgreementId
        },
        {
          $set: {
            active: newLegal.active,
            description: newLegal.description,
            releaseDate: newLegal.releaseDate,
            lastModifierPersonalId: newLegal.registerPersonalId
          }
        },
        () => {
          return resolve(true);
        }
      )
      .catch(err => {
        return reject(false);
      });
  });
};
