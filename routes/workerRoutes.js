const express = require('express');
const router = express.Router();

const {
  registration,
  updateDetails,
  workerProfile,
} = require('../controllers/workerController');

router.post('/registration', registration);
router.get('/workerProfile', workerProfile);
router.patch('/updateDetails', updateDetails);


module.exports = router;
