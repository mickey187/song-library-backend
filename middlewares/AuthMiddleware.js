require('dotenv').config();
const jwt = require("jsonwebtoken");
const { pathToRegexp } = require("path-to-regexp");
const User = require("../models/User");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;



function getParentRoute(route) {
  const parts = route.split("/");
  parts.pop();
  return parts.join("/");
}

const requireAuth = async (req, res, next) => {
  console.log("path: ", req.originalUrl);

  const requestedRoute = req.path;
  const parentRoute = getParentRoute(requestedRoute);

  const token = req.header("Authorization");
  console.log("req.header(Authorization)",req.header("Authorization"))
  if (!token) {
    console.log("Missing token");
    
    return res.status(498).send("Missing token");
  }

  // Check if the token is blacklisted.
  try {
    // Verify and decode the token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
      if (err) {
        console.log("err", err)
        return res.status(498).send("Expired token");
      } else {
        req.user = decodedToken;
        return next();
      }
    });
  } catch (error) {
    return res.status(500).send("Server error"); // Handle unexpected errors
  }
};

module.exports = { requireAuth };
