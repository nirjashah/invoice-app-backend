// Module dependencies
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mysql = require('mysql');

// Application initialization

var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'password'
});

// Database setup

connection.query('CREATE DATABASE IF NOT EXISTS invoiceApp', function (err) {
    if (err) throw err;
     console.log('invoiceApp db created');
    connection.query('USE invoiceApp', function (err) {
        if (err) throw err;
        console.log('using invoiceApp db');
        connection.query('CREATE TABLE IF NOT EXISTS Invoice('+
            'invoiceID VARCHAR(30) NOT NULL,'+
            'PRIMARY KEY(invoiceID),'+
            'customerName VARCHAR(30) NOT NULL,'+
            'customerEmail VARCHAR(30) NOT NULL,'+
            'dueDate DATE NOT NULL'+
            ');', function (err) {
                if (err) throw err;
                console.log(' created Invoice table');
            });
    });
  });

// parse application/json
router.use(bodyParser.json());

//Example invoice data
// { invoiceID: 'INVOICE_hz61pc8jn',
//   customerInfo: { customerName: 'navya', customerEmail: 'as@gmail.com' },
//   dueDate: '2017-11-16',
//   lineItems: [ { lineItemID: 0, lineDescription: 'desc', lineAmount: '45' } ] }

// POST for invoice data. Update MySQL database
router.post('/', function(req, res, next) {
    //console.log('Posting invoice-', req.body.invoiceToBeStored);
    //res.sendStatus(200);
    // var invoiceID = req.body.invoiceToBeStored.invoiceID;
    // var customerName = req.body.invoiceToBeStored.customerInfo.customerName;
    // var customerEmail = req.body.invoiceToBeStored.customerInfo.customerEmail;
    // var dueDate = req.body.invoiceToBeStored.dueDate;
    //
    // console.log('Before inserting: ', invoiceID, customerName, customerEmail, dueDate);
    var payload = {
              invoiceID: req.body.invoiceToBeStored.invoiceID,
              customerName: req.body.invoiceToBeStored.customerInfo.customerName,
              customerEmail: req.body.invoiceToBeStored.customerInfo.customerEmail,
              dueDate: req.body.invoiceToBeStored.dueDate,
                    };
    var data = JSON.stringify(payload);
    console.log('Before inserting: ', data);
    connection.query('INSERT INTO Invoice SET ?', data,
        function (err, result) {
            if (err) throw err;
            res.send('User added to database with ID: ' + result.insertId);
        }
);
});

module.exports = router;
