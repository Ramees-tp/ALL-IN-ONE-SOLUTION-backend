const WorkerDetails = require('../models/workerRegistration');
const UserDetails = require('../models/userDetails');
const UserOTP = require('../models/userOTP');
const AddDetails = require('../models/userMoreDetails');
const JobForm =require('../models/workSchema');
const WorkRequest = require('../models/workRequests');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const sendEmail = require('../utils/nodemailer');
require('dotenv').config();

const {default: mongoose} = require('mongoose');

maxAge = 7 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({id}, process.env.ACCESS_TOKEN, {expiresIn: maxAge});
};

const obj = {
  signUp: async (req, res) => {
    const {username, email, password} = req.body;
    console.log(req.body);

    try {
      const existUser = await UserDetails.findOne({email});
      if (!existUser) {
        const hashedPass = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        const newUser = new UserDetails({
          username,
          email,
          password: hashedPass,
        });
        await newUser.save();

        const Token = createToken(newUser._id);
        res.cookie('jwt', Token, {
          httponly: true,
          maxAge: maxAge * 1000,
          secure: true,
        });
        console.log('userController:', Token);

        return res.status(200).json({
          user: newUser._id,
          message: 'User registered successfully',
          Token,
        });
      } else {
        return res
            .status(400)
            .json({message: 'User with this email already exists'});
      }
    } catch (error) {
      console.error('Error during signUp:', error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
  login: async (req, res) => {
    const {username, password} = req.body;

    try {
      const existUser = await UserDetails.findOne({username});
      if (existUser) {
        const checkPass = bcrypt.compareSync(password, existUser.password);
        if (checkPass) {
          return res
              .status(200)
              .json({message: 'User logged in successfully'});
        } else {
          return res
              .status(400)
              .json({message: 'invalid password, try again'});
        }
      } else {
        return res
            .status(404)
            .json({message: 'User with this Username dont exist'});
      }
    } catch (err) {
      res.status(500).json({error: 'ivalid details', err});
    }
  },
  userOTP: async (req, res) => {
    const {email} = req.body;
    const decodedToken = req.decodedToken;

    try {
      const userid = decodedToken.id;

      const existUser = await UserDetails.findOne({_id: userid});
      if (existUser) {
        if (existUser.email !== email) {
          return res.status(400).json({error: 'Invalid email provided'});
        }

        const OTP = Math.floor(100000 + Math.random() * 900000);
        const existMail = await UserOTP.findOne({email});

        if (existMail) {
          const updateData = await UserOTP.findByIdAndUpdate(
              {_id: existMail._id},
              {userId: existUser._id, OTP: OTP},
              {new: true},
          );
          await updateData.save();

          const sendMail = await sendEmail(
              email,
              'sending email for authentication',
              `OTP:${OTP}`,
          );

          if (!sendMail) {
            return res.status(400).json({message: 'Sending Email failed'});
          } else {
            return res
                .status(200)
                .json({message: 'Email with OTP dispatched'});
          }
        } else {
          const saveNew = new UserOTP({
            userId: existUser._id,
            email,
            OTP: OTP,
          });
          await saveNew.save();

          const sendMail = await sendEmail(
              email,
              'sending email for authentication',
              `OTP:${OTP}`,
          );

          if (!sendMail) {
            return res.status(400).json({message: 'Sending Email failed'});
          } else {
            return res
                .status(200)
                .json({message: 'Email with OTP dispatched'});
          }
        }
      } else {
        res.status(400).json({error: 'user with this email not exist'});
      }
    } catch (err) {
      res.status(400).json({error: 'ivalid details', err});
    }
  },
  verifyOTP: async (req, res) => {
    const {otpValues} = req.body;
    const otp = parseInt(otpValues.join(''), 10);
    try {
      const otpPass = await UserOTP.findOne({OTP: otp});

      if (otpPass) {
        await UserOTP.findOneAndUpdate({OTP: otp}, {$unset: {OTP: ''}});
        return res.status(200).json({message: 'Correct OTP'});
      } else {
        return res.status(400).json({message: 'Incorrect otp'});
      }
    } catch (err) {
      res.status(500).json({error: 'Invalid OTP details', err});
    }
  },
  resetPass: async (req, res) => {
    const {password} = req.body;

    const decodedToken = req.decodedToken;
    try {
      const userid = decodedToken.id;

      const user = await UserDetails.findOne({_id: userid});
      if (user) {
        const hashPass = await bcrypt.hashSync(
            password,
            bcrypt.genSaltSync(10),
        );
        user.password = hashPass;
        await user.save();
        return res.status(200).json({message: 'password updated success'});
      } else {
        return res.status(404).json({error: 'User not found'});
      }
    } catch (err) {
      console.error('Error decoding token:', err);
      res.status(401).json({error: 'Invalid or expired token'});
      return;
    }
  },
  addDetails: async (req, res) => {
    const {
      firstName,
      lastName,
      DOB,
      phoneNumber,
      city,
      // coordinates,
      district,
      pinCode} = req.body;
    const [longitude, latitude] = req.body.coordinates.split(',').map(Number);

    if (!req.file || !req.file.location) {
      return res.status(400).json({error: 'Invalid file uploaded'});
    }
    const image = req.file.location;
    console.log('userImage:', image);

    const Token = await req.headers.authorization.split(' ')[1];
    console.log('deatailToken', Token);
    try {
      const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN);
      const userID = decodedToken.id;

      const user = await UserDetails.findOne({_id: userID});
      if (user) {
        await AddDetails.updateOne(
            {userId: userID},
            {
              $set: {
                firstName,
                lastName,
                DOB,
                phoneNumber,
                city,
                coordinates: [longitude, latitude],
                district,
                pinCode,
                userImage: image,
              },
            },
            {upsert: true},
        );
        return res.status(200).json({message: 'updated successfully'});
      } else {
        return res.status(404).json({message: 'user not found'});
      }
    } catch (err) {
      console.error('Error decoding token:', err);
      res.status(401).json({error: 'Invalid or expired token'});
      return;
    }
  },
  userProfile: async (req, res) => {
    const Token = await req.headers.authorization.split(' ')[1];
    try {
      const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN);
      userID = decodedToken.id;
      const userData = await UserDetails.findOne({_id: userID});
      if (!userData) {
        return res.status(400).json({message: 'no user found'});
      }
      const fullData = await UserDetails.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(userID)}},
        {
          $lookup: {
            from: 'usermoredetails',
            localField: '_id',
            foreignField: 'userId',
            as: 'moredetails',
          },
        },
      ]);
      console.log(fullData);
      return res
          .status(200)
          .json({fullData, message: 'sending user details'});
    } catch (err) {
      console.log('Error decoding token', err);
      res.status(401).json({error: 'invalid or expired token'});
    }
  },

  workerDetails: async (req, res) =>{
    workerId = req.params.id;
    try {
      const worker = await WorkerDetails.find({_id: workerId});
      if (!worker) {
        return res.status(404).json({message: 'worker not found'});
      }
      res.status(200).json({data: worker, message: 'worker data success'});
    } catch (err) {
      res.
          status(500)
          .json({message: 'back: internal server error'});
    }
  },
  workRequest: async (req, res) => {
    const {selectedDate, selectedDay} =req.body;
    const workerId = req.params.id;
    const decodedToken = req.decodedToken;
    const userId = decodedToken.id;
    try {
      const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
      const request = await WorkRequest.create({
        workerId,
        userId,
        date: formattedDate,
        day: selectedDay,
      });
      return res.status(201).json({request, message: 'your request sended'});
    } catch (error) {
      console.error(error);
      res.status(500).json({message: 'Server Error'});
    }
  },
  userhome: async (req, res)=>{
    try {
      const jobData = await JobForm.find();
      return res
          .status(200)
          .json({data: jobData, message: 'job data fetching success'});
    } catch (err) {
      res.
          status(500)
          .json({message: 'internal server error'});
    }
  },
  userlocation: async (req, res)=>{
    const decodedToken = req.decodedToken;
    try {
      const userId = decodedToken.id;

      const user = await AddDetails.findOne({userId: userId});
      const userLocation = user.city;
      const userCoordinates = user.coordinates;
      console.log('location', userLocation);

      return res
          .status(200)
          .json({
            data: userLocation,
            latlong: userCoordinates,
            message: 'location fetch success'});
    } catch (err) {
      res.
          status(500)
          .json({message: 'backend server error'});
    }
  },
  newlocation: async (req, res)=>{
    const location = req.query.location;
    try {
      const filteredData = await
      WorkerDetails.find({city: {$regex: new RegExp(location, 'i')}});
      res.status(200).json({data: filteredData, message: 'mission success'});
    } catch (err) {
      res.status(500).json({message: 'Backend server error'});
    }
  },

  fetchWorker: async (req, res)=>{
    const {latitude, longitude} = req.query;
    const id = req.params.id;
    const workType = await JobForm.findOne({_id: id});
    const job =workType.jobName;
    try {
      const workers = await WorkerDetails.find({
        jobType: job,
        isApproved: true,
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: 10*1000,
          },
        },
      });
      res.status(200)
          .json({data: workers, message: 'fetching worker list success'});
    } catch (error) {
      console.error(error);
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
  showRequests: async (req, res)=>{
    const decodedToken = req.decodedToken;
    try {
      const userId = decodedToken.id;
      const requests = await WorkRequest.find({userId}).populate('workerId');
      res.status(200).json({success: true, requests});
    } catch (err) {
      console.error(err);
      res.status(500)
          .json({success: false, message: 'Internal server error'});
    }
  },
  cancelRequest: async (req, res) =>{
    const requestId = req.params.id;
    console.log(requestId);
    const decodedToken = req.decodedToken;
    try {
      const userId = decodedToken.id;
      const request = await WorkRequest
          .deleteOne({userId, _id: requestId});
      if (request.deletedCount === 1) {
        return res
            .status(200)
            .json({success: true, message: 'Request deleted successfully'});
      } else {
        return res
            .status(404).json({success: false, message: 'Request not found'});
      }
    } catch (err) {
      console.error(err);
      res.status(500)
          .json({success: false, message: 'Internal server error'});
    }
  },
  payment: async (req, res) =>{
    const razorpay = new Razorpay({
      key_id: process.env.RAZ_KEY_ID,
      key_secret: process.env.RAZ_SECRET_KEY,
    });
    try {
      const options = req.body;
      console.log(options);
      const order = await razorpay.orders.create(options);
      if (!order) {
        return res.status(400).json({error: 'order not Found'});
      }
      return res.status(200).json({data: order});
    } catch (err) {
      console.error(err);
      res.status(500)
          .json({success: false, message: 'Internal server error'});
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
        return res.status(400).json({message: 'transation is not legit'});
      }
      const order = await WorkRequest.findByIdAndUpdate(
          orderId,
          {
            payment: true,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
          },
          {new: true, upsert: true},
      );
      return res
          .status(200)
          .json({
            message: 'transation is success',
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id
          });
    } catch (err) {
      console.error(err);
      res.status(500)
          .json({success: false, message: 'Internal server error'});
    }
  },
};

module.exports = obj;
