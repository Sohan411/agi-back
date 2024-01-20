const express = require('express');
const app = express();
require('dotenv').config();
const routes = require('./routes');
const cors = require('cors');

// Replace body-parser with express.json() and express.urlencoded()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(routes);

app.listen(process.env.APP_PORT, () => {
  console.log(`App listening on port`, process.env.APP_PORT);
});
