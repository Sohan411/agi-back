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

async function getObjectURL(key) {
  console.log('Entering getObjectURL function');

  // If the key already contains the full URL, extract the path
  const cleanedKey = key.startsWith('https://') ? new URL(key).pathname.substring(1) : key;

  const command = new GetObjectCommand({
    Bucket: 'agi-form',
    Key: cleanedKey
  });

  const url = await getSignedUrl(s3client, command);
  console.log('Exiting getObjectURL function');
  return url;
}


async function putObject(filename){
  console.log('Entering putObjectputObject function');
  const command = new PutObjectCommand({
    Bucket : 'agi-form',
    Key : `${filename}`,
  });
  const url = await getSignedUrl(s3client, command);
  return url;
  console.log('Exiting putObject function');
}

function postGoodsData(req, res) {
  console.log('Entering postGoodsData function');
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

  console.log('Request Body:', req.body);

  const postGoodsDataQuery = `INSERT INTO  agi_goods_data(location, operatorName, transaction, segment, gateKeeperName, customerName, invoiceNumber, amount, barcode, partNo, branchName, deliveryNote, branchDeliveryNote, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`;

  async function postImage() {
    console.log('Entering postImage function');
    let noteUrl = null;

    // Check if deliveryNote is not empty
    if (deliveryNote) {
      console.log('deliveryNote is not empty');
      // Assuming putObject is an asynchronous function
      noteUrl = await putObject(deliveryNote);
      console.log('putObject returned:', noteUrl);
    }

    console.log('Note URL:', noteUrl);

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
          console.log('Post Goods Data Error:',postGoodsDataError);
          return res.status(401).json({ message: 'error while inserting goods data' });
        }
        console.log('Goods data inserted successfully');
        res.status(200).json({ message: 'data inserted successfully' });
      }
    );
    console.log('Exiting postImage function');
  }
  postImage();

  console.log('Exiting postGoodsData function');
}

async function getGoodsData(req, res) {
  const getGoodsDataQuery = `SELECT * FROM agi_goods_data`;

  db.query(getGoodsDataQuery, async (getGoodsDataError, getGoodsDataResult) => {
    if (getGoodsDataError) {
      console.log('Get Goods Data Error:', getGoodsDataError);
      return res.status(500).json({ message: 'error while fetching goods data' });
    }

    // Iterate through the result and add signed URLs to the response
    const goodsDataWithUrls = await Promise.all(
      getGoodsDataResult.map(async (data) => {
        if (data.deliveryNote) {
          const deliveryNoteUrl = await getObjectURL(data.deliveryNote);
          return { ...data, deliveryNoteUrl };
        }
        return data;
      })
    );

    console.log('Goods data fetched successfully', goodsDataWithUrls );
    res.status(200).json({ goodsData: goodsDataWithUrls });
  });
}


module.exports = {
  postGoodsData,
  getGoodsData
}