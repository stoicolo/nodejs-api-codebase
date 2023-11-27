let whitelist = [
  "http://198.199.68.127",
  "http://drbookin.com",
  "http://core.drbookin.com",
  "http://localhost:3007",
];

let corsConfig = {
  origin: (origin, callback) => {
    console.log("origin", origin);
    // if (whitelist.indexOf(origin) !== -1) {
    //   return callback(null, true);
    // } else {
    //   return callback(new Error("Not allowed by CORS"));
    // }
    return callback(null, true);
  },
};

module.exports = corsConfig;
