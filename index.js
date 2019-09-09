const express = require("express");

module.exports = config => {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.sendFile("./admin.html");
    res.end();
  });

  return router;
};
