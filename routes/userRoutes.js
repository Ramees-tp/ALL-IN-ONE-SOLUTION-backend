const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  signUp,
  login,
  userOTP,
  verifyOTP,
  resetPass,
  addDetails,
  userProfile,
  awailWorker,
  userhome,
  userlocation,
  newlocation,
  fetchWorker,
  workerDetails,
  workRequest,
} = require('../controllers/userController');

router.post('/signUp', signUp);
router.post('/login', login);
router.post('/userOTP', verifyToken, userOTP);
router.post('/verifyOTP', verifyOTP);
router.post('/resetPass', verifyToken, resetPass);
router.put('/addDetails', addDetails);
router.get('/userProfile', userProfile);

router.get('/awailWorker/:id', awailWorker);
router.get('/workerDetails/:id', workerDetails);
router.get('/userhome', userhome);
router.get('/userlocation', verifyToken, userlocation);
router.get('/newlocation', verifyToken, newlocation);
router.post('/workRequest/:id', workRequest);

router.get('/fetchWorker', fetchWorker);

module.exports = router;
