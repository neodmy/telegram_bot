const cron = require('node-cron');
const axios = require('axios');

module.exports = (address) => cron.schedule('* */25 * * * *', () => {
  axios.get(`${address}/healthcheck`);
});
