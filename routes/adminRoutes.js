const express = require('express');
const router = express.Router();

const {workerRequest, approveAccess, rejectAccess} = require('../controllers/adminController');


router.get('/workerRequest', workerRequest);
router.patch('/approveAccess/:id', approveAccess);
router.patch('/rejectAccess/:id', rejectAccess);

module.exports= router;
