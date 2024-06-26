const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {upload} = require('../utils/multer');
const verifyToken = require('../middlewares/verifyToken');
const {
  signUp,
  login,
  userOTP,
  verifyOTP,
  resetPass,
  addDetails,
  userProfile,
  userhome,
  userlocation,
  newlocation,
  fetchWorker,
  workerDetails,
  workRequest,
  showRequests,
  cancelRequest,
  payment,
  validatePayment,
  saveMessages,
  showMessage,
  logOut,
  likedWorker,
  unLikeWorker,
  likedList,
} = require('../controllers/userController');

router.post('/signUp', signUp);
router.post('/login', login);
router.post('/logOut', verifyToken, logOut);
router.post('/userOTP', verifyToken, userOTP);
router.post('/verifyOTP', verifyOTP);
router.post('/resetPass', verifyToken, resetPass);
router.put('/addDetails', upload.single('userImage'), addDetails);
router.get('/userProfile', userProfile);


router.get('/workerDetails/:id', workerDetails);
router.get('/userhome', userhome);
router.get('/userlocation', verifyToken, userlocation);
router.get('/newlocation', verifyToken, newlocation);
router.post('/workRequest/:id', verifyToken, workRequest);

router.get('/fetchWorker/:id', fetchWorker);
router.get('/showRequests', verifyToken, showRequests);
router.delete('/cancelRequest/:id', verifyToken, cancelRequest);
router.post('/payment', payment);
router.post('/validatePayment', validatePayment);
router.post('/saveMessages', saveMessages);
router.get('/showMessage', showMessage);

router.post('/likedWorker', verifyToken, likedWorker);
router.delete('/unLikeWorker/:id', verifyToken, unLikeWorker);
router.get('/likedList', verifyToken, likedList);

module.exports = router;
