const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const routes = require('./routes')


app.use(bodyParser);
app.use(routes);

app.listen(process.env.APP_PORT, () =>{
  console.log(`app listening on port`, process.env.APP_PORT)
})