const express = require('express');
const router = express.Router();

const GD = require('./GoodsData/GoodsData');
const PC = require('./PettyCash/PettyCash');

router.get('/getGoodsData', GD.getGoodsData);
router.get('/postGoodsData', GD.postGoodsData);

router.get('/getPettyCash', PC.getPettyCash);
router.get('postPettyCash', PC.postPettyCash);

module.exports = router