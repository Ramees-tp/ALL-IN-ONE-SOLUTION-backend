const WorkerDetails = require('../models/workerRegistration');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({id}, process.env.ACCESS_TOKEN_WORKER, {expiresIn: maxAge});
};

const obj = {
  registration: async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      dateOfBirth,
      district,
      city,
      pinCode,
      jobType,
      workArea,
      adharNumber,
      IFC,
      accountNumber,
      panCardNumber,
      password,
    } = req.body;
    try {
      const existWorker = await WorkerDetails.findOne({email});
      if (existWorker) {
        return res
            .status(200)
            .json({
              message: 'user with this email already exist, please login',
            });
      } else {
        const hashPass = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        const newWorker = new WorkerDetails({
          firstName,
          lastName,
          email,
          phoneNumber,
          gender,
          dateOfBirth,
          district,
          city,
          pinCode,
          jobType,
          workArea,
          adharNumber,
          IFC,
          accountNumber,
          panCardNumber,
          password: hashPass,
        });
        await newWorker.save();

        const Token = createToken(newWorker._id);
        res.cookie('wjwt', Token, {
          httponly: true,
          maxAge: maxAge * 1000,
          secure: true,
        });
        console.log('workerController:', Token);

        return res
            .status(200)
            .json({message: 'worker registration success', Token});
      }
    } catch (error) {
      console.error('Error during signUp:', error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
  workerProfile: async (req, res)=>{
    try {
      const workerDetails = await WorkerDetails.findOne({_id});
      res.
          status(200)
          .json({data: workerDetails, message: 'data fetched successfully'});
    } catch (err) {
      res.
          status(500)
          .json({message: 'internal server error'});
    }
  },
  updateDetails: async (req, res)=>{
    const {} =req.body;
  },
};

module.exports= obj;
