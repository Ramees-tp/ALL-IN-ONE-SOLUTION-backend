/* eslint-disable camelcase */
const workerDetails = require('../models/workerRegistration');
const WorkRequest = require('../models/workRequests');
const JobForm = require('../models/workSchema');
const UserData = require('../models/userMoreDetails');
const userLessData = require('../models/userDetails');
const AdminAuth = require('../models/masterAuth');
// const twilioOtp = require('../utils/twilio');
const sendEmail = require('../utils/nodemailer');

const Razorpay = require('razorpay');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

maxAge = 2 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt
      .sign({id, role: 'admin'}, process.env.ACCESS_TOKEN, {expiresIn: maxAge});
};

const obj = {
  hashAdminPass: async (req, res) => {
    const {password} = req.body;
    try {
      if (!password) {
        return res.status(400).json({error: 'Password is required'});
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      res.status(200).json({hashedPassword});
    } catch (err) {
      res.status(500).json({error: 'Failed to hash password'});
    }
  },
  login: async (req, res) => {
    try {
      const {username, password} = req.body;
      const isAdmin = await AdminAuth.findOne({mastername: username});
      if (!isAdmin) {
        return res
            .status(400)
            .json({message: 'You are not a Admin'});
      }
      const passCheck= bcrypt.compareSync(password, isAdmin.password);
      if (!passCheck) {
        return res
            .status(400)
            .json({message: 'Incorrect Password'});
      }
      const Token = createToken(isAdmin._id);
      res.cookie('jwt', Token, {
        httponly: true,
        maxAge: maxAge * 1000,
        secure: true,
      });
      return res
          .status(200)
          .json({message: 'Welcome Admin', Token});
    } catch (error) {
      res.status(500).json({error: 'Internal server error'});
    }
  },
  workerRequest: async (req, res) => {
    try {
      const forApproval = await workerDetails.find({isApproved: false});
      const totalCount = await workerDetails.countDocuments({
        isApproved: false,
      });

      res
          .status(200)
          .json({data: forApproval, totalCount, message: 'Data fetch success'});
    } catch (error) {
      res
          .status(500)
          .json({error: 'Server error', errorMessage: error.message});
    }
  },
  approveAccess: async (req, res) => {
    const id = req.params.id;
    try {
      const worker = await workerDetails.findById(id);
      if (!worker) {
        return res.status(404).json({message: 'Worker not found'});
      }
      const phoneNumber = worker.phoneNumber;
      const EMAIL = worker.email;
      if (!phoneNumber) {
        return res
            .status(404)
            .json({message: 'Phone number not found for the worker'});
      }

      worker.isApproved = true;
      await worker.save();

      // const sendSms = await twilioOtp(phoneNumber);
      const sendMail = await sendEmail(
          EMAIL,
          'Entry request approved',
          'welcome worker to our webapp, have a nice day',
      );

      if (!sendMail) {
        return res.status(400).json({message: 'Sending SMS failed'});
      } else {
        return res
            .status(200)
            .json({message: 'SMS dispatched, Given access to worker'});
      }
    } catch (error) {
      res.status(500).json({error: 'Internal server error'});
    }
  },
  rejectAccess: async (req, res) => {
    const id = req.params.id;
    try {
      const request = await workerDetails.findById({_id: id});
      if (!request) {
        return res.status(404).json({message: 'user not found'});
      }
      request.isApproved = false;
      return res.status(200).json({message: 'request rejected'});
    } catch (error) {
      res.status(500).json({error: 'Internal server error'});
    }
  },
  workerList: async (req, res) => {
    try {
      const users = await workerDetails.find({isApproved: true});
      const totalCount = await workerDetails.countDocuments({
        isApproved: true,
      });
      res.status(200).json({
        data: users,
        totalCount,
        message: 'fetching user data success',
      });
    } catch (error) {
      res.status(500).json({error: 'internal server error'});
    }
  },
  addJobType: async (req, res) => {
    try {
      const {jobName, jobDescription, wage} = req.body;

      if (!req.file || !req.file.location) {
        return res.status(400).json({error: 'Invalid file uploaded'});
      }
      const image = req.file.location;

      const newForm= new JobForm({
        jobName,
        jobDescription,
        wage,
        jobImage: image,
      });
      await newForm.save();

      res
          .status(200)
          .json({message: 'Job type added successfully', imageUrl: image});
    } catch (error) {
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
  requestDetails: async (req, res) => {
    try {
      const requests = await WorkRequest
          .find({payment: true}).populate('workerId');

      res.status(200).json({success: true, data: requests});
    } catch (error) {
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
  paymentsToDo: async (req, res) => {
    try {
      const users = await WorkRequest
          .find({completed: true})
          .populate('workerId');
      return res.status(200).json({data: users, message: 'completed works'});
    } catch (error) {
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
  payment: async (req, res) => {
    const razorpay = new Razorpay({
      key_id: process.env.RAZ_KEY_ID,
      key_secret: process.env.RAZ_SECRET_KEY,
    });
    try {
      const options = req.body;
      const order = await razorpay.orders.create(options);
      if (!order) {
        return res.status(400).json({error: 'order not Found'});
      }
      return res.status(200).json({data: order});
    } catch (error) {
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
  validatePayment: async (req, res) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;
    try {
      const sha = crypto.createHmac('sha256', process.env.RAZ_SECRET_KEY);
      sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = sha.digest('hex');
      if (digest !== razorpay_signature) {
        return res.status(400).json({message: 'admin transation is not legit'});
      }
      const updatedWorkRequest = await WorkRequest.findOneAndUpdate(
          {_id: orderId},
          {$set: {gotWage: true}},
          {new: true, upsert: true},
      );
      if (!updatedWorkRequest) {
        return res.status(404).json({message: 'Work request not found'});
      }
      return res.status(200).json({message: 'payment for worker done'});
    } catch (error) {
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
  gotWageTrue: async (req, res) => {
    try {
      const users = await WorkRequest
          .find({gotWage: true})
          .populate('workerId');
      return res.status(200).json({data: users, message: 'completed works'});
    } catch (error) {
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
  userList: async (req, res) =>{
    try {
      const users = await userLessData.aggregate([
        {
          $lookup: {
            from: 'usermoredetails',
            localField: '_id',
            foreignField: 'userId',
            as: 'moreDetails',
          },
        },
      ]);
      const totalCount = await UserData.countDocuments({});
      res.status(200).json({data: users, totalCount});
    } catch (error) {
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
};

module.exports = obj;
