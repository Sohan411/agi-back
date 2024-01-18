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

function getGoodsData(req,res){
  const getGoodsDataQuery = `SELECT * FROM agi_goods_data`;
  db.query(getGoodsDataQuery, (getGoodsDataError, getGoodsDataResult) =>{
    if(getGoodsDataError){
      console.log(getGoodsDataError);
      return res.status(401).json({message : 'error while fetching goods data'});
    }
    if(getGoodsDataResult.length === 0){
      return res.status(404).json({message : 'no Goods Data Found'});
    }
    res.status(200).json({getGoodsData : getGoodsDataResult});
  });
}

function postGoodsData(req, res){
  const {location, operatorName, transaction, segment, gateKeeperName, customerName, invoiceNumber, amount, barcode, partNo, branchName, deliveryNote, branchDeliveryNote} = req.body
  const postGoodsDataQuery = `INSERT INTO  agi_goods_data(location, operatorName, transaction, segment, gateKeeperName, customerName, invoiceNumber, amount, barcode, partNo, branchName, deliveryNote, branchDeliveryNote, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`;

  async function postImage(){
    const noteUrl = await putObject(deliveryNote);
  

    db.query(postGoodsDataQuery, [location, operatorName, transaction, segment, gateKeeperName, customerName, invoiceNumber, amount, barcode, partNo, branchName, noteUrl, branchDeliveryNote], (postGoodsDataError, postGoodsDataResult) => {
      if(postGoodsDataError){
        console.log(postGoodsDataError);
        return res.status(401).json({message : 'error while inserting goods data'});
      }
      res.status(200).json({message : 'data inserted successfully'});
    });
  }
}



module.exports = {
  getGoodsData,
  postGoodsData,
}