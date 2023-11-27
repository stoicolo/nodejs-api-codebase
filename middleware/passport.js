const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');
const Email = require('../models/Email');

const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

module.exports = () => {

  let passwordFromLogin = "";

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, (email, password, callback) => {

    passwordFromLogin = password;

    return Email.findByEmail(email)
      .then((user, err) => {
        // Match User
        if (!user) {
          return callback(null, false);
        }
       return User.getUserByPersonalId(user.personalId)
        .then((user, err) => {

          if (!user) {
            throw new Error(err);
          };

          // Match Password
          User.comparePassword(passwordFromLogin, user.password, (err, isMatch) => {

            if (err) throw err;
            if (isMatch) {
              return callback(null, user);
            }
            return callback(err);

          });

        }).catch(err => callback(err));

      }).catch(err => callback(err))

    }));

  passport.use(new JWTStrategy({
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'drbookin costarica'
    },
    (jwtPayload, callback) => {

      //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
      return User.findOneById(jwtPayload.id)
        .then(user => {
          return callback(null, user);
        })
        .catch(err => {
          return callback(err);
        });
    }
  ));


}
