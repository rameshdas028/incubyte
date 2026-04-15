const express = require("express");

function createApp(db) {
  const app = express();
  app.use(express.json());
  return app;
}

module.exports = { createApp };
