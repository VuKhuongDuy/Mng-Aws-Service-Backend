const express =require('express')
let router = express.Router()
let handle_vm = require('../../controller/handle_vm.js')

router.post('/', handle_vm.listvm)
router.delete('/', handle_vm.delete_vm)
router.post('/create', handle_vm.create)
router.put("/start", handle_vm.start)
router.put("/stop", handle_vm.stop)
router.post('/make-plan', handle_vm.makePlan)
// router.get('/check-plan', handle_vm.checkPlan)
router.get('/plans', handle_vm.listPlan)
router.delete('/delete-plan', handle_vm.deletePlan)

module.exports = router