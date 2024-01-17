const db = require('../db');

function getGoodsData(req,res){
  const getGoodsDataQuery = `SELECT * FROM agi_goods_data`;
  db.query(getGoodsDataQuery, (getGoodsDataError, getGoodsDataResult) =>{
    if(getGoodsDataError){
      console.log(getGoodsDataError);
      return res.status(401).json({message : 'error while fetching goods data'});
    }
    res.status(200).json({getGoodsData : getGoodsDataResult});
  });
}

module.exports = {
  getGoodsData,
}