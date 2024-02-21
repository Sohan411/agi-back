const db = require('../db');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

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

  const postGoodsDataQuery = `INSERT INTO agi_goods_data(location, operatorName, transaction, segment, gateKeeperName, customerName, invoiceNumber, amount, barcode, partNo, branchName, deliveryNote, branchDeliveryNote, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`;

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
      deliveryNote,
      branchDeliveryNote
    ],
    (postGoodsDataError, postGoodsDataResult) => {
      if (postGoodsDataError) {
        console.log('Post Goods Data Error:', postGoodsDataError);
        return res.status(401).json({ message: 'error while inserting goods data' });
      }
      console.log('Goods data inserted successfully');
      res.status(200).json({ message: 'data inserted successfully' });
    }
  );
}

function generateUniqueFileName() {
  return `${uuidv4()}`;
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