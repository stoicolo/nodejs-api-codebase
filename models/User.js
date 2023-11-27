"use strict";

let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");

// User Collection Name
const USERS_COLLECTION = "user";

// Users Schema Instance
let UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  personalId: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  role: {
    type: [String],
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImageId: {
    type: String,
    required: false,
  },
  registrationDate: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  passwordLastChange: {
    type: String,
    required: true,
  },
});

/**
 * User Model instance using User Collection Name, and User Schema Instance.
 * Second User Collection avoids collection naming in plural by Mongoose.
 */
let userModel = mongoose.model(USERS_COLLECTION, UserSchema, USERS_COLLECTION);
module.exports.UserModel = userModel;

/**
 * create a new user data document. password is hashed during this process.
 * @param  {} newUser
 */
module.exports.createUser = (newUser) => {
  return new Promise((resolve, reject) => {
    // creating a new User Model obj with already validated req.body data
    let newUserData = new userModel(newUser);

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUserData.password, salt, (err, hash) => {
        if (err) throw err;
        newUserData.password = hash;
        newUserData
          .save()
          .then((user_Model) => {
            resolve(user_Model);
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
  });
};

/**
 * get a user module data by personalId.
 * @param  {} personalId
 */
module.exports.getUserByPersonalId = (personalId) => {
  return new Promise((resolve, reject) => {
    userModel
      .findOne({
        personalId: personalId,
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
 * get a user module data by userId.
 * @param  {} userId
 */
module.exports.getUserByUserID = (userId) => {
  return new Promise((resolve, reject) => {
    userModel
      .findOne({
        userId: userId,
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
 * get a user module data by name and role.
 * @param  {} userName
 */
module.exports.getDoctorByUserName = (userName) => {
  return new Promise((resolve, reject) => {
    let valueMatch = new RegExp(userName);

    userModel
      .find({
        userId: valueMatch,
        role: "doctor",
      })

      .then((user, err) => {
        if (user) {
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
 * check if an existing user's active status is true.
 * @param  {} user
 */
module.exports.isAnActiveUser = (user) => {
  return new Promise((resolve, reject) => {
    userModel
      .findOne({
        personalId: user.personalId,
      })
      .then((userData) => {
        if (userData !== null && userData !== undefined && userData._id) {
          return resolve(userData); // returning false in order to activate this user.
        } else {
          return resolve(false);
        }
      })
      .catch((err) => {
        return reject(false);
      });
  });
};

/**
 * change user's role by personalId.
 * @param  {} user is an array which contains roles assigned to User.
 */
module.exports.changeRoleByPersonalId = (personalId, role = []) => {
  return new Promise((resolve, reject) => {
    userModel
      .updateOne(
        {
          personalId: personalId,
        },
        { $set: { role: role } },
        () => {
          return resolve(true);
        }
      )
      .catch((err) => {
        return reject(false);
      });
  });
};

/**
 * chante user's active status to active.
 * @param  {} user
 */
module.exports.activateUser = (user) => {
  return new Promise((resolve, reject) => {
    userModel
      .updateOne(
        {
          personalId: user.personalId,
        },
        { $set: { active: true } },
        () => {
          return resolve(true);
        }
      )
      .catch((err) => {
        return reject(false);
      });
  });
};

/**
 * compare two passwords to check if there is a match.
 * @param  {} candidatePassword
 * @param  {} hash
 * @param  {} callback
 */
module.exports.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) callback(err);
    callback(null, isMatch);
  });
};

/**
 * Validates Data for User Form
 * @param  {} body
 */
module.exports.validateUserData = (body) => {
  // validating new user form data

  body.checkBody("userId", "Usuario es requerido").notEmpty();
  body
    .checkBody("userId")
    .matches("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$")
    .withMessage(
      "Formato de Usuario no es válido, debe tener un dígito, una mayúscula, y mínimo 8 caracteres de largo."
    );
  body
    .checkBody("personalId", "Número de Identificación es requerido")
    .notEmpty();
  body.checkBody("firstName", "Nombre es requerido").notEmpty();
  body.checkBody("lastName", "Apellidos son requeridos").notEmpty();
  body.checkBody("password", "Contraseña es requerida").notEmpty();
  body
    .checkBody("password")
    .matches("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).{8,}$")
    .withMessage(
      "Contraseña no es válida, debe tener un dígito, una mayúscula, un símbolo, y mínimo 8 caracteres de largo."
    );
  // body.checkBody('profileImageId', 'Profile Image Id is required').notEmpty();
  body
    .checkBody("registrationDate", "Fécha de Registro es requerido")
    .notEmpty();
  body.checkBody("active", "Active es requerido").notEmpty();
  body.checkBody("email", "Email es requerido").notEmpty();
  body.checkBody("email", "Email no es válido").isEmail();
  body
    .checkBody(
      "passwordLastChange",
      "Fécha de último cambio contraseña es requerido"
    )
    .notEmpty();
  // body.checkBody('titleName', 'Title Name value is not valid').notEmpty();
  body
    .checkBody("phoneNumber")
    .isLength({
      min: 8,
    })
    .withMessage("Número de teléfono de ser de almenos 8 caracteres de largo");
  body
    .checkBody("phoneNumber")
    .matches("\\d{3}[\\s]\\d{4}[\\s]\\d{4}")
    .withMessage("Número de teléfono no es valido");

  return body.validationErrors();
};

/**
 * Update User Data by Personal Id.
 * @param  {} user is an array which contains roles assigned to User.
 */
module.exports.updatedUser = (newUserData) => {
  return new Promise((resolve, reject) => {
    console.log("newUserData");
    console.log(newUserData);
    // password changed
    if (newUserData.password !== "Test@2020") {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUserData.password, salt, (err, hash) => {
          if (err) throw err;
          newUserData.password = hash;
        });
      });
    }

    userModel
      .updateOne(
        {
          personalId: newUserData.personalId,
        },
        {
          $set: {
            password: newUserData.password,
          },
        },
        () => {
          return resolve(true);
        }
      )
      .catch((err) => {
        return reject(false);
      });
  });
};
