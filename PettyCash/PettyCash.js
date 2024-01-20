const db = require('../db');
const { S3Client, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3client = new S3Client({
  region : 'ap-south-1',
  credentials : {
    accessKeyId:'AKIAS6GGC64POCZ2BBE5',
    secretAccessKey: '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'
  }
});

async function getObjectURL(key){
  const command = new GetObjectCommand({
    Bucket : 'agi-form',
    Key : `/${key}`
  });
  const url = await getSignedUrl(s3client,command)
  return url;
}

async function putObject(filename){
  const command = new PutObjectCommand({
    Bucket : 'agi-form',
    Key : `${filename}`,
  });
  const url = await getSignedUrl(s3client, command);
  return url;
}

function getPettyCash(req,res){
  const getPettyCashQuery = `SELECT * FROM agi_petty_cash`;
  db.query(getPettyCashQuery, (getPettyCashError, getPettyCashResult) =>{
    if(getPettyCashError){
      console.log(getPettyCashError);
      return res.status(401).json({message : 'error while fetching goods data'});
    }
    if(getPettyCashResult.length === 0){
      return res.status(404).json({message : 'No Data Found'});
    }
    res.status(200).json({getPettyCash : getPettyCashResult});
  });
}

function postPettyCash(req, res){
  const {location, operatorName, transaction, segment, customerName, invoiceNumber, amount, modeOfPayment, description, bankName, typeOfTransaction, deliveryNote} = req.body
  const postPettyCashQuery = `INSERT INTO  agi_goods_data(location, operatorName, transaction, segment, customerName, invoiceNumber, amount, modeOfPayment, description, bankName, typeOfTransaction, createdAt, deliveryNote) VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW(),?)`;

  async function postImage(){
    const noteUrl = await putObject(deliveryNote);

    db.query(postPettyCashQuery, [location, operatorName, transaction, segment, customerName, invoiceNumber, amount, modeOfPayment, description, bankName, typeOfTransaction, noteUrl], (postPettyCashError, postPettyCashResult) => {
      if(postGoodsDataError){
        console.log(postPettyCashError);
        return res.status(401).json({message : 'error while inserting goods data'});
      }
      res.status(200).json({message : 'data inserted successfully'});
    });
  }
}


function getDisplay(req, res) {
  const { formType, location, segment, startDate, endDate } = req.body;

  console.log(formType, location, segment, startDate, endDate);

  if (formType === 'PettyCash') {
    const getPettyCashQuery = 'SELECT * FROM agi_petty_cash WHERE location = ? AND segment = ? AND createdAt BETWEEN ? AND ?';
    const queryParams = [location, segment, startDate, endDate];

    db.query(getPettyCashQuery, queryParams, (getPettyCashError, getPettyCashResult) => {
      if (getPettyCashError) {
        console.error(getPettyCashError);
        return res.status(500).json({ message: 'Error while fetching petty cash data' });
      }
      if (getPettyCashResult.length === 0) {
        return res.status(404).json({ message: 'No Data Found' });
      }
      res.status(200).json({ data: getPettyCashResult });
    });
  } else if (formType === 'OutwardGoods') {
    const getGoodsDataQuery = 'SELECT * FROM agi_goods_data WHERE location = ? AND segment = ? AND createdAt BETWEEN ? AND ?';
    const queryParams = [location, segment, startDate, endDate];

    db.query(getGoodsDataQuery, queryParams, (getGoodsDataError, getGoodsDataResult) => {
      if (getGoodsDataError) {
        console.error(getGoodsDataError);
        return res.status(500).json({ message: 'Error while fetching goods data' });
      }
      if (getGoodsDataResult.length === 0) {
        return res.status(404).json({ message: 'No Goods Data Found' });
      }
      res.status(200).json({ data: getGoodsDataResult });
    });
  } else {
    return res.status(404).json({ message: 'Invalid Form type' });
  }
}



module.exports = {
  getPettyCash,
  postPettyCash,
  getDisplay
}