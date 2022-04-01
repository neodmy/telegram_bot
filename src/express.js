const express = require('express');

const app = express();

app.get('/healthcheck', (req, res) => {
  res.send();
});

module.exports = app;
