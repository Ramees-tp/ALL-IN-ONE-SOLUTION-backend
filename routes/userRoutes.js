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
} = require('../controllers/userController');

router.post('/signUp', signUp);
router.post('/login', login);
router.post('/userOTP', userOTP);
router.post('/verifyOTP', verifyOTP);
router.post('/resetPass', resetPass);
router.patch('/addDetails', addDetails);
router.get('/userProfile', userProfile);

module.exports = router;
