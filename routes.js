const express = require('express');
const router = express.Router();

const GD = require('./GoodsData/GoodsData');
const PC = require('./PettyCash/PettyCash');

router.get('/getGoodsData', GD.getGoodsData);

module.exports = router