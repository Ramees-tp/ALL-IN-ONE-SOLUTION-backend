const express = require('express');
const router = express.Router();
const {upload} = require('../utils/multer');
const {
  workerRequest,
  approveAccess,
  rejectAccess,
  workerList,
  addJobType,
  requestDetails,
  paymentsToDo,
  payment,
  validatePayment,
  gotWageTrue,
  userList,
  hashAdminPass,
  login,

} = require('../controllers/adminController');

router.post('/hashAdminPass', hashAdminPass);
router.post('/login', login);

router.get('/workerRequest', workerRequest);
router.patch('/approveAccess/:id', approveAccess);
router.patch('/rejectAccess/:id', rejectAccess);
router.get('/workerList', workerList);
router.post('/addJobType', upload.single('jobImage'), addJobType);
router.get('/requestDetails', requestDetails);

router.get('/paymentsToDo', paymentsToDo);
router.get('/gotWageTrue', gotWageTrue);
router.post('/payment', payment);
router.post('/validatePayment', validatePayment);

router.get('/userList', userList);

module.exports = router;

