const db = require('../db');
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: 'AKIAS6GGC64POCZ2BBE5',
    secretAccessKey: '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'
  }
});

async function getObjectURL(key) {
  console.log('Entering getObjectURL function');
  const command = new GetObjectCommand({
    Bucket: 'agi-form',
    Key: `/${key}`
  });
  const url = await getSignedUrl(s3client, command);
  console.log('Exiting getObjectURL function');
  return url;
}

async function putObject(filename) {
  console.log('Entering putObject function');
  const command = new PutObjectCommand({
    Bucket: 'agi-form',
    Key: `${filename}`,
  });
  const url = await getSignedUrl(s3client, command);
  console.log('Exiting putObject function');
  return url;
}

// function postPettyCash(req, res) {
//   // console.log('Entering postPettyCash function');
//   const {
//     location,
//     operatorName,
//     transaction,
//     segment,
//     customerName,
//     invoiceNumber,
//     amount,
//     modeOfPayment,
//     description,
//     bankName,
//     typeOfTransaction,
//     deliveryNote
//   } = req.body;

//   // console.log('Request Body:', req.body);

//   const postPettyCashQuery = `INSERT INTO agi_petty_cash(location, operatorName, transaction, segment, customerName, invoiceNumber, amount, modeOfPayment, description, bankName, typeOfTransaction, createdAt, deliveryNote) VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW(),?)`;

//   async function postImage() {
//     // console.log('Entering postImage function');
//     let noteUrl = null;

//     if (deliveryNote) {
//       // console.log('deliveryNote is not empty');
//       noteUrl = await putObject(deliveryNote);
//       // console.log('putObject returned:', noteUrl);
//     }

//     console.log('Note URL:', noteUrl);

//     db.query(
//       postPettyCashQuery,
//       [
//         location,
//         operatorName,
//         transaction,
//         segment,
//         customerName,
//         invoiceNumber,
//         amount,
//         modeOfPayment,
//         description,
//         bankName,
//         typeOfTransaction,
//         noteUrl
//       ],
//       (postPettyCashError, postPettyCashResult) => {
//         if (postPettyCashError) {
//           // console.log('Post Petty Cash Error:', postPettyCashError);
//           return res.status(401).json({ message: 'error while inserting petty cash data' });
//         }
//         // console.log('Petty Cash data inserted successfully');
//         res.status(200).json({ message: 'data inserted successfully' });
//       }
//     );

//     // console.log('Exiting postImage function');
//   }

//   postImage();

//   // console.log('Exiting postPettyCash function');
// }

function postPettyCash(req, res) {
  try {
    const {
      location,
      operatorName,
      transaction,
      segment,
      customerName,
      invoiceNumber,
      amount,
      modeOfPayment,
      description,
      bankName,
      typeOfTransaction,
      deliveryNote
    } = req.body;

    // Modify the query to include the deliveryNote as a base64 string
    const postPettyCashQuery = `
      INSERT INTO agi_petty_cash(
        location, operatorName, transaction, segment, customerName, invoiceNumber, 
        amount, modeOfPayment, description, bankName, typeOfTransaction, createdAt, deliveryNote
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW(),?)
    `;

    // Insert the data into the database
    db.query(
      postPettyCashQuery,
      [
        location,
        operatorName,
        transaction,
        segment,
        customerName,
        invoiceNumber,
        amount,
        modeOfPayment,
        description,
        bankName,
        typeOfTransaction,
        deliveryNote // Use the base64 string directly
      ],
      (postPettyCashError, postPettyCashResult) => {
        if (postPettyCashError) {
          console.error('Error while inserting petty cash data:', postPettyCashError);
          return res.status(401).json({ message: 'Error while inserting petty cash data' });
        }
        res.status(200).json({ message: 'Data inserted successfully' });
      }
    );
  } catch (error) {
    console.error('Exception:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


function getDisplay(req, res) {
  // console.log('Entering getDisplay function');
  const { formType, location, segment, startDate, endDate } = req.body;

  // console.log('Request Body:', req.body);

  // console.log('Form Type:', formType, 'Location:', location, 'Segment:', segment, 'Start Date:', startDate, 'End Date:', endDate);

  if (formType === 'PettyCash') {
    // console.log('Form Type is PettyCash');
    const getPettyCashQuery = 'SELECT * FROM agi_petty_cash WHERE location = ? AND segment = ? AND createdAt BETWEEN ? AND ?';
    const queryParams = [location, segment, startDate, endDate];

    db.query(getPettyCashQuery, queryParams, (getPettyCashError, getPettyCashResult) => {
      if (getPettyCashError) {
        console.error('Get Petty Cash Error:', getPettyCashError);
        return res.status(401).json({ message: 'Error while fetching petty cash data' });
      }
      if (getPettyCashResult.length === 0) {
        return res.status(404).json({ message: 'No Data Found' });
      }
      console.log('Petty Cash data fetched successfully');
      res.status(200).json({ data: getPettyCashResult });
    });
  } else if (formType === 'OutwardGoods') {
    // console.log('Form Type is OutwardGoods');
    const getGoodsDataQuery = 'SELECT * FROM agi_goods_data WHERE location = ? AND segment = ? AND createdAt BETWEEN ? AND ?';
    const queryParams = [location, segment, startDate, endDate];

    db.query(getGoodsDataQuery, queryParams, (getGoodsDataError, getGoodsDataResult) => {
      if (getGoodsDataError) {
        // console.error('Get Goods Data Error:', getGoodsDataError);
        return res.status(500).json({ message: 'Error while fetching goods data' });
      }
      if (getGoodsDataResult.length === 0) {
        return res.status(404).json({ message: 'No Goods Data Found' });
      }
      // console.log('Goods data fetched successfully');
      res.status(200).json({ data: getGoodsDataResult });
    });
  } else {
    // console.log('Invalid Form Type');
    return res.status(404).json({ message: 'Invalid Form type' });
  }

  // console.log('Exiting getDisplay function');
}

module.exports = {
  postPettyCash,
  getDisplay
};
