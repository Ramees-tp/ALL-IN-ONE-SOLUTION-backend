const WorkerDetails = require('../models/workerRegistration');
const UserDetails = require('../models/userDetails');
const UserOTP = require('../models/userOTP');
const AddDetails = require('../models/userMoreDetails');
const JobForm =require('../models/workSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const sendEmail = require('../utils/nodemailer');
require('dotenv').config();

const {default: mongoose} = require('mongoose');

maxAge = 3 * 24 * 60 * 60;
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
    const decodedToken = req.decodedToken

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
  // function to
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
      // const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);
      // console.log(`decoded : ${JSON.stringify(decodedToken)}`);
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
    const {firstName, lastName, DOB, phoneNumber, city, district, pinCode} =
      req.body;
    const Token = req.headers.authorization.split(' ')[1];
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
                district,
                pinCode,
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
            from: 'userMoreDetails',
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
  awailWorker: async (req, res)=>{
    const id = req.params.id;
    const workType = await JobForm.findOne({_id: id});
    const job =workType.jobName;
    try {
      const awailWorker = await WorkerDetails.find({jobType: job});
      console.log(awailWorker);
      if (!awailWorker) {
        return res.status(404).json({message: 'No worker found in Your City'});
      }
      return res
          .status(200)
          .json({data: awailWorker, message: 'fetching data success'});
    } catch (err) {
      res.
          status(500)
          .json({message: 'internal server error'});
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
      console.log('userId:', userId);

      const user = await AddDetails.findOne({userId: userId});
      const userLocation = user.city;
      console.log('location', userLocation);

      return res
          .status(200)
          .json({data: userLocation, message: 'location fetch success'});
    } catch (err) {
      res.
          status(500)
          .json({message: 'backend server error'});
    }
  },
};

module.exports = obj;
