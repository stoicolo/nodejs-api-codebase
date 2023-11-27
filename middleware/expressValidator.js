const expressValidator = require('express-validator');
const express_Validator = (
  expressValidator({
    errorFormatter: (param, msg, value) => {
      let namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }

      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

module.exports = express_Validator;
