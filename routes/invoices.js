var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');


// parse application/json
router.use(bodyParser.json());

/* POST for invoice data */
router.post('/', function(req, res, next) {
    console.log('Posting invoice-', req.body.invoiceToBeStored);
    res.sendStatus(200);
});

module.exports = router;
