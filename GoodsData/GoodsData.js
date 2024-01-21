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

function postGoodsData(req, res) {
  const {
    location,
    operatorName,
    transaction,
    segment,
    gateKeeperName,
    customerName,
    invoiceNumber,
    amount,
    barcode,
    partNo,
    branchName,
    deliveryNote,
    branchDeliveryNote
  } = req.body;

  const postGoodsDataQuery = `INSERT INTO  agi_goods_data(location, operatorName, transaction, segment, gateKeeperName, customerName, invoiceNumber, amount, barcode, partNo, branchName, deliveryNote, branchDeliveryNote, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`;

  async function postImage() {
    let noteUrl = null;

    // Check if deliveryNote is not empty
    if (deliveryNote) {
      // Assuming putObject is an asynchronous function
      noteUrl = await putObject(deliveryNote);
    }

    db.query(
      postGoodsDataQuery,
      [
        location,
        operatorName,
        transaction,
        segment,
        gateKeeperName,
        customerName,
        invoiceNumber,
        amount,
        barcode,
        partNo,
        branchName,
        noteUrl, // Use noteUrl whether it's null or the S3 URL
        branchDeliveryNote
      ],
      (postGoodsDataError, postGoodsDataResult) => {
        if (postGoodsDataError) {
          console.log(postGoodsDataError);
          return res.status(401).json({ message: 'error while inserting goods data' });
        }
        res.status(200).json({ message: 'data inserted successfully' });
      }
    );
  }
}




module.exports = {
  postGoodsData,
}