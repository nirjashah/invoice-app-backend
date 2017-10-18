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
        connection.query('CREATE TABLE IF NOT EXISTS InvoiceLineItem('+
            'lineItemID INT(11) NOT NULL,'+
            'lineDescription VARCHAR(100),'+
            'lineAmount DECIMAL(10, 2) NOT NULL,'+
            'invoiceLineFkId INT(11) NOT NULL,'+
            'CONSTRAINT invoiceLineFkId FOREIGN KEY (invoiceLineFkId) REFERENCES Invoice(invoiceID)'+
            ');', function (err) {
                if (err) throw err;
                console.log(' created InvoiceLineItem table');
            });
    });
  });

// parse application/json
router.use(bodyParser.json());

// POST for invoice data. Create entry in MySQL database
router.post('/', function(req, res, next) {
    var customerName = req.body.invoiceToBeStored.customerInfo.customerName;
    var customerEmail = req.body.invoiceToBeStored.customerInfo.customerEmail;
    var dueDate = req.body.invoiceToBeStored.dueDate;
    var lineItems = req.body.invoiceToBeStored.lineItems;
    console.log('Before inserting in Invoice table: ', customerName, customerEmail, dueDate);
    var post  = {
                  customerName: customerName,
                  customerEmail: customerEmail,
                  dueDate: dueDate
                };
    createInvoiceWithCustomerDetails(post).then(function(data){
      console.log("Data: ", data);
      console.log("lineItems: ", lineItems);
      return createInvoiceLineItem(data, lineItems);
    }).then(function(status){
        res.sendStatus(status)
    }).catch(function (error) {
    throw error;
  });

});

//GET invoice data
router.get('/', function(req, res){
    var data ={
      "Data": ""
    };
    var query = connection.query('SELECT * from InvoiceLineItem',
            function(err, rows, fields) {
              if(rows.length != 0){
                data["Data"] = rows;
                res.json(data);
            }else{
                data["Data"] = 'No data Found..';
                res.json(data);
            }
        });
    console.log("Query to get all invoices: ", query.sql);
});

// First query to inset data in Invoice table
function createInvoiceWithCustomerDetails(post) {
    return new Promise((resolve, reject) => {
        var query = connection.query('INSERT INTO Invoice SET ?', post,
            function(err, result) {
              if (err) reject(err);
              //res.send('Invoice added to database with ID: ' + result.insertId);
              resolve(result.insertId);
            });
        console.log("Invoice table query: ",query.sql);
    });
};

// Second query to inset data in InvoiceLineItem table
function createInvoiceLineItem(invoiceIDfk, lineItems) {
    return new Promise((resolve, reject) => {

      lineItems.forEach(function (lineItem) {
          var lineItemID = lineItem.lineItemID;
          var lineDescription = lineItem.lineDescription;
          var lineAmount = lineItem.lineAmount;
          var invoiceLineFkId = invoiceIDfk;
          console.log('Before inserting line item: ', lineItemID, lineDescription, lineAmount);
          var post = {
                      lineItemID: lineItemID,
                      lineDescription: lineDescription,
                      lineAmount: lineAmount,
                      invoiceLineFkId: invoiceLineFkId
                    };

          var query = connection.query('INSERT INTO InvoiceLineItem SET ?', post,
              function(err, result) {
                if (err) reject(err);
                resolve(200);
                //res.send('Invoice line item added to database with ID: ' + result.insertId);
              });
          console.log("Invoice line item query: ", query.sql);
    });
  });
};

module.exports = router;
