const nodemailer = require('nodemailer');
const ejs = require('ejs');
const connection = require('./db');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'kpohekar19@gmail.com',
    pass: 'woptjevenzhqmrpp',
  },
});

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sendMail(){
  const today = new Date();
  const formattedDate = formatDate(today);

  const queryGoodsData = `SELECT * FROM agi_goods_data WHERE DATE(createdAt) = '${formattedDate}'`;
  const queryPettyCashData = `SELECT * FROM agi_petty_cash WHERE DATE(createdAt) = '${formattedDate}'`

  // Fetch goods data
  connection.query(queryGoodsData, (err, goodsData) => {
      if (err) throw err;

      const defaultGoodsDataEntry = {
        id: 0,
        location: '0',
        operatorName: '0',
        transaction: '0',
        segment: '0',
        gateKeeperName: '0',
        customerName: '0',
        invoiceNumber: '0',
        amount: '0',
        barcode: '0',
        partNo: '0',
        branchName: '0',
        deliveryNote: '0',
        branchDeliveryNote: '0',
        createdAt: formattedDate
    };
    
      if (goodsData.length === 0) {
        goodsData = [defaultGoodsDataEntry];
    }
      // Fetch petty cash data
      connection.query(queryPettyCashData, (err, pettyCashData) => {
          if (err) throw err;

          const defaultPettyCashDataEntry = {
            id: 0,
            location: '0',
            operatorName: '0',
            transaction: '0',
            segment: '0',
            customerName: '0',
            invoiceNumber: '0',
            amount: '0',
            modeOfPayment: '0',
            description: '0',
            bankName: '0',
            typeOfTransaction: '0',
            createdAt: formattedDate,
            deliveryNote: '0'
        };
        
        if (pettyCashData.length === 0) {
          pettyCashData = [defaultPettyCashDataEntry];
        }

          // Render EJS template with dynamic data
          ejs.renderFile('./ejs/emailTemplate.ejs', {
              date: new Date().toLocaleDateString(),
              goodsData: goodsData,
              pettyCashData: pettyCashData
          }, (err, html) => {
              if (err) throw err;

              // Email options
              const mailOptions = {
                  from: 'kpohekar19@gmail.com',
                  to: 'amco.cash123@gmail.com',
                  subject: 'Daily Report',
                  html: html
              };

              // Send email
              transporter.sendMail(mailOptions, (err, info) => {
                  if (err) throw err;
                  console.log('Email sent:', info.response);
              });
          });
      });
  });
}

module.exports = sendMail;