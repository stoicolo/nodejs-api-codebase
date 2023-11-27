module.exports = {
  // Format of Token
  // Authorization: Bearer <access_token>
  // Verifies user is logged in.
  ensureAuthenticated: function (req, res, next) {

    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
      // Split at the space
      const bearer = bearerHeader.split(' ');
      // Get token from array
      const bearerToken = bearer[1];
      // Set the token
      req.token = bearerToken;

      if (req.isAuthenticated()) {
        // Next middelware
        return next();
      } else {
        res.status(401).send(res.isAuthenticated);
      }
    } else {
      // Forbidden
      res.status(403).send(res.isAuthenticated);
    }
  }
}
