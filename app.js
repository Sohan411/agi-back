const express = require('express');
const app = express();
require('dotenv').config();
const routes = require('./routes');
const cors = require('cors');
const cron = require('node-cron');
// const sendMail = require('./DailyReport')

// Replace body-parser with express.json() and express.urlencoded()
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cors());

app.use(routes);

// Schedule the script to run daily at 6:30 pm IST
// cron.schedule('18 30 * * *', () => {
//   const dateTime = new Date();
//   console.log("Mail send to Kaushal and Sohan at time:-", dateTime )
//   sendMail();
// });


app.listen(process.env.APP_PORT, () => {
  console.log(`App listening on port`, process.env.APP_PORT);
});
