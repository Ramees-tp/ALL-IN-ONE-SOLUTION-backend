const express = require('express');
const router = express.Router();
const workerVerifyToken = require('../middlewares/workerVerifyToken');
const {upload} = require('../utils/multer');

const {
  registration,
  updateDetails,
  workerProfile,
  workRequest,
} = require('../controllers/workerController');


router.post('/registration', upload.single('profileImage'), registration);
router.get('/workerProfile', workerVerifyToken, workerProfile);
router.patch('/updateDetails', updateDetails);
router.get('/workRequest', workRequest);


module.exports = router;
