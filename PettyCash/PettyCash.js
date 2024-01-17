const db = require('../db');

function getPettyCash(req,res){
  const getPettyCashQuery = `SELECT * FROM agi_petty_cash`;
  db.query(getPettyCashQuery, (getPettyCashError, getPettyCashResult) =>{
    if(getPettyCashError){
      console.log(getPettyCashError);
      return res.status(401).json({message : 'error while fetching goods data'});
    }
    res.status(200).json({getPettyCash : getPettyCashResult});
  });
}
module.exports = {
  getPettyCash,
}