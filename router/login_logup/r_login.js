const express = require('express')
let router = express.Router();
let {check_login}= require('../../controller/handle_login_logup.js');

router.post('/', check_login)

module.exports = router