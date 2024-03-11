const WorkerDetails = require('../models/workerRegistration');
const WorkRequest = require('../models/workRequests');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

maxAge = 7 * 24 * 60 * 60;
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
    const [longitude, latitude] = req.body.coordinates.split(',').map(Number);

    if (!req.file || !req.file.location) {
      return res.status(400).json({error: 'Invalid file uploaded'});
    }
    const image = req.file.location;
    console.log('Image uploaded successfully:', image);
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
          profileImage: image,
          jobType,
          workArea,
          coordinates: [longitude, latitude],
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
    const Token = await req.headers.workerauth.split(' ')[1];
    try {
      const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_WORKER);
      workerID = decodedToken.id;
      const workerData = await WorkerDetails.findOne({_id: workerID});
      if (!workerData) {
        return res.status(400).json({message: 'no worker found'});
      }
      return res
          .status(200)
          .json({
            data: workerData, message: 'fetching worker details positive'});
    } catch (err) {
      console.log('Error decoding token', err);
      res.status(401).json({error: 'invalid or expired token'});
    }
  },
  updateDetails: async (req, res)=>{
    const {} =req.body;
  },
  workRequest: async (req, res)=> {
    const Token = await req.headers.workerauth.split(' ')[1];
    const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_WORKER);
    const workerId = decodedToken.id;
    try {
      const requests = await WorkRequest
          .find({workerId})
          .populate({
            path: 'userId', select: 'firstName lastName profileImage',
          });
      res.json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).json({message: 'Server Error'});
    }
  },

};

module.exports= obj;
