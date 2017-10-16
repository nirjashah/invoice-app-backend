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
            'invoiceID INT(11) NOT NULL AUTO_INCREMENT,'+
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
    //var invoiceID = req.body.invoiceToBeStored.invoiceID;
    var customerName = req.body.invoiceToBeStored.customerInfo.customerName;
    var customerEmail = req.body.invoiceToBeStored.customerInfo.customerEmail;
    var dueDate = req.body.invoiceToBeStored.dueDate;

    console.log('Before inserting: ', customerName, customerEmail, dueDate);

    var post  = {
                  customerName: customerName,
                  customerEmail: customerEmail,
                  dueDate: dueDate
                };
    var query = connection.query('INSERT INTO Invoice SET ?', post,
        function(err, result) {
          if (err) throw err;
          res.send('User added to database with ID: ' + result.insertId);
        });
    console.log(query.sql);

    /*connection.query('INSERT INTO Invoice SET customerName='+ `customerName` +
    ',customerEmail='+ `customerEmail` +
    ',dueDate='+ `dueDate`,
        function (err, result) {
            if (err) throw err;
            res.send('User added to database with ID: ' + result.insertId);
        }
);*/
});

module.exports = router;
