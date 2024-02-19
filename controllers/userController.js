const UserDetails = require('../models/userDetails');
const UserOTP = require('../models/userOTP');
const bcrypt = require('bcrypt');
const nodeMailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const userDetails = require('../models/userDetails');
const addDetails = require('../models/userMoreDetails');
require('dotenv').config();

const transporter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

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
            .status(400)
            .json({message: 'User with this Username don\'t exists'});
      }
    } catch (err) {}
  },
  userOTP: async (req, res) => {
    const {email} = req.body;
    const token = req.headers.authorization.split(' ')[1];

    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);
      console.log(`decoded : ${JSON.stringify(decodedToken)}`);
      const userid = decodedToken.id;

      const existUser = await UserDetails.findOne({_id: userid});
      if (existUser) {
        if (existUser.email !== email) {
          return res.status(400).json({error: 'Invalid email provided'});
        }

        const OTP = Math.floor(100000 + Math.random() * 900000);
        const existMail = await UserOTP.findOne({email});
        console.log(existMail);
        if (existMail) {
          const updateData = await UserOTP.findByIdAndUpdate(
              {_id: existMail._id},
              {userId: existUser._id, OTP: OTP},
              {new: true},
          );
          await updateData.save();

          const mail = {
            from: process.env.EMAIL,
            to: email,
            subject: 'sending OTP for authentication',
            text: `OTP:${OTP}`,
          };
          transporter.sendMail(mail, (error, info) => {
            if (error) {
              res.status(400).json({error: 'email not send'});
            } else {
              console.log('email send', info.response);
              res.status(200).json({message: 'success'});
            }
          });
        } else {
          const saveNew = new UserOTP({
            userId: existUser._id,
            email,
            OTP: OTP,
          });
          await saveNew.save();

          const mail = {
            from: process.env.EMAIL,
            to: email,
            subject: 'sending email for authentication',
            text: `OTP:${OTP}`,
          };
          transporter.sendMail(mail, (error, info) => {
            if (error) {
              res.status(400).json({error: 'email not send'});
            } else {
              console.log('email send', info.response);
              res.status(200).json({message: 'success'});
            }
          });
        }
      } else {
        res.status(400).json({error: 'user with this email not exist'});
      }
    } catch (err) {
      res.status(400).json({error: 'ivalid details', err});
    }
  },
  verifyOTP: async (req, res) => {
    const {verificationId, otpValues} = req.body;
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

    const token = req.headers.authorization.split(' ')[1];
    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);
      console.log(`decoded : ${JSON.stringify(decodedToken)}`);
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
    const {firstName, lastName, DOB, phoneNumber, street, district, pinCode} =
      req.body;
    const Token = req.headers.authorization.split(' ')[1];
    try {
      const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN);
      const userID = decodedToken.id;

      const user = await userDetails.findOne({_id: userID});
      if (user) {
        const updateProfile = await addDetails.updateOne(
            {userId: userID},
            {
              $set: {
                firstName,
                lastName,
                DOB,
                phoneNumber,
                street,
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
    console.log(req.body);
  },
  userProfile: async (req, res)=>{
    const Token=await req.headers.authorization.split(' ')[1];
    try {
      const decodedToken=jwt.verify(Token, process.env.ACCESS_TOKEN);
      userID=decodedToken.id;
      const userData = await userDetails.findOne({_id: userID});
      if (!userData) {
        return res.status( 400).json({message: 'no user found'});
      }
      return res.status(200).json({userData, message: 'sending user details'})
    } catch (err) {
      console.log('Error decoding token', err);
      res.status(401).json({error: 'invalid or expired token'});
    }
  },
};

module.exports = obj;
