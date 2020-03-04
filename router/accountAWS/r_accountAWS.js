const express = require('express')
let router = express.Router();
let handle_accountAWS = require('../../controller/handle_accountAWS.js')

router.get('/', handle_accountAWS.list)
router.post('/add', handle_accountAWS.add)
router.delete('/', handle_accountAWS.delete_account)

module.exports = router