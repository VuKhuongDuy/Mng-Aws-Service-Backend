const express = require('express')
let router = express.Router();
const {
    STATUS_ERROR,
    STATUS_SUCCESS,
    STATUS_BADREQUEST
  } = require("../../statusCode");

router.post('/', function(req, res){
    setLocale(req.query.lang)
    res.redirect('back');
})

module.exports = router