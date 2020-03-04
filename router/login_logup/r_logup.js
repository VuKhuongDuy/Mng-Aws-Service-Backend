const express = require('express')
let router = express.Router();
let {verify_email}= require('../../controller/handle_login_logup.js');
let {create_user}= require('../../controller/handle_login_logup.js');
let {list_user} = require('../../controller/handle_login_logup.js')

router.post('/email', verify_email)
router.post('/', create_user)
router.get('/', list_user)

module.exports = router