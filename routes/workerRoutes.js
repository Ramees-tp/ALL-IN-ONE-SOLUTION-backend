const express = require('express');
const router = express.Router();
const workerVerifyToken = require('../middlewares/workerVerifyToken');

const {
  registration,
  updateDetails,
  workerProfile,
  workRequest,
} = require('../controllers/workerController');

router.post('/registration', registration);
router.get('/workerProfile', workerVerifyToken, workerProfile);
router.patch('/updateDetails', updateDetails);
router.get('/workRequest', workRequest);


module.exports = router;
