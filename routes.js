const express = require('express');
const router = express.Router();

const GD = require('./GoodsData/GoodsData');
const PC = require('./PettyCash/PettyCash');

router.post('/postGoodsData', GD.postGoodsData);

router.post('/postPettyCash', PC.postPettyCash);
router.post('/getDisplay', PC.getDisplay);

module.exports = router