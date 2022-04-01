const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('OK');
});

app.get('/healthcheck', (req, res) => {
  res.send();
});

module.exports = app;
