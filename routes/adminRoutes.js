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
} = require('../controllers/adminController');

router.get('/workerRequest', workerRequest);
router.patch('/approveAccess/:id', approveAccess);
router.patch('/rejectAccess/:id', rejectAccess);
router.get('/workerList', workerList);
router.post('/addJobType', upload.single('jobImage'), addJobType);
router.get('/requestDetails', requestDetails);

module.exports = router;

