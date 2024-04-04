const UserDetails = require('../models/userDetails');
const WorkerDetails = require('../models/workerRegistration');
const WorkRequest = require('../models/workRequests');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

maxAge = 2 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({id, role: 'worker'},
      process.env.ACCESS_TOKEN_WORKER, {expiresIn: maxAge});
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
            .status(404)
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
        res.cookie('jwt', Token, {
          httponly: true,
          maxAge: maxAge * 1000,
          secure: true,
        });

        return res
            .status(200)
            .json({message: 'worker registration success', Token});
      }
    } catch (error) {
      res.status(500).json({message: 'Internal server error'});
    }
  },
  login: async (req, res)=>{
    try {
      const {email, password} = req.body;
      const existWorker = await WorkerDetails.findOne({email});
      if (existWorker) {
        const checkPass = bcrypt.compareSync(password, existWorker.password);
        if (checkPass) {
          const Token = createToken(existWorker._id);
          res.cookie('jwt', Token, {
            httponly: true,
            maxAge: maxAge * 1000,
            secure: true,
          });
          return res
              .status(200)
              .json({message: 'worker logged in successfully', Token});
        } else {
          return res
              .status(400)
              .json({message: 'invalid password, try again'});
        }
      } else {
        return res
            .status(400)
            .json({message: 'worker not found, try again'});
      }
    } catch (error) {
      res.status(500).json({message: 'Internal server error'});
    }
  },
  logOut: async (req, res) => {
    try {
      const decodedToken = req.decodedWorkerToken;
      const workerId = decodedToken.id;

      const existWorker = WorkerDetails.findOne({_id: workerId});
      if (existWorker) {
        return res.status(200).json({message: 'worker is legit'});
      }
      return res.status(404).json({message: 'no worker Found'});
    } catch (error) {
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
      res.status(401).json({error: 'invalid or expired token'});
    }
  },
  updateProfile: async (req, res)=>{
    const decodedId = req.decodedWorkerToken;
    const id = decodedId.id;
    const {
      firstName,
      lastName,
      email,
      phone,
      city,
      pinCode,
      district,
    } =req.body;
    try {
      const worker = await WorkerDetails.findOneAndUpdate(
          {_id: id},
          {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            city: city,
            pinCode: pinCode,
            district: district,
          },
          {new: true},
      );

      if (!worker) {
        return res.status(404).json({message: 'Worker not found'});
      }

      return res.status(200).json(worker);
    } catch (error) {
      res.status(500).json({message: ' Server Error'});
    }
  },
  workRequest: async (req, res)=> {
    const Token = await req.headers.workerauth.split(' ')[1];
    const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_WORKER);
    const workerId = decodedToken.id;
    try {
      const requests = await WorkRequest
          .find({workerId});
      const userIds = requests.map((request) => request.userId);

      const LookData = await UserDetails.aggregate([
        {$match: {
          _id: {$in: userIds},
        }},
        {
          $lookup: {
            from: 'usermoredetails',
            localField: '_id',
            foreignField: 'userId',
            as: 'moredetails',
          },
        },
      ]);

      const requestsWithUserData = requests.map((request) => {
        const userData =
         LookData.find((data) => String(data._id) === String(request.userId));
        return {
          ...request.toObject(),
          userData: userData ? userData.moredetails[0] : null,
        };
      });

      res.status(200).json({requests: requestsWithUserData});
    } catch (error) {
      res.status(500).json({message: ' Server Error'});
    }
  },
  acceptOrDecline: async (req, res) => {
    const id = req.params.id;
    const action = req.query.action;
    try {
      const request = await WorkRequest.findById({_id: id});
      if (!request) {
        return res.status(404).json({message: 'Work request not found'});
      }
      if (action==='accept') {
        request.status= 'accepted';
      } else if (action === 'decline') {
        request.status= 'declined';
      }
      await request.save();
      res.status(200).json({message: 'Work request updated successfully'});
    } catch (error) {
      res.status(500).json({message: ' Server Error'});
    }
  },
  updateIsHalfDay: async (req, res) => {
    const {isHalfDay} = req.body;
    const decodedToken = req.decodedWorkerToken;
    const workerId = decodedToken.id;
    try {
      const worker = await WorkerDetails.findById({_id: workerId});
      if (!worker) {
        return res.status(404).json({message: 'Worker not found'});
      }
      worker.isHalfDay = isHalfDay;
      await worker.save();
      res
          .status(200)
          .json({message: 'Worker updated successfully',
            isHalfDay: worker.isHalfDay});
    } catch (error) {
      res.status(500).json({message: 'Internal server error'});
    }
  },
  updateOnline: async (req, res) => {
    const {isOnline} = req.body;
    const decodedToken = req.decodedWorkerToken;
    const workerId = decodedToken.id;
    try {
      const worker = await WorkerDetails.findById({_id: workerId});
      if (!worker) {
        return res.status(404).json({message: 'Worker not found'});
      }
      worker.isOnline = isOnline;
      await worker.save();
      res
          .status(200)
          .json({message: 'Worker updated successfully',
            isHalfDay: worker.isHalfDay});
    } catch (error) {
      res.status(500).json({message: 'Internal server error'});
    }
  },

  verifyOTP: async (req, res) => {
    const {otpValues, orderId} = req.body;
    const otp = parseInt(otpValues.join(''), 10);
    try {
      const request = await WorkRequest.findOne({_id: orderId});
      if (!request) {
        return res.status(404).json({message: 'not found'});
      }
      const secretCodeInt = parseInt(request.secretcode, 10);
      if (secretCodeInt===otp) {
        request.completed=true;
        await request.save();
        return res
            .status(200)
            .json({success: true, message: 'found correct Otp'});
      } else {
        return res
            .status(400)
            .json({success: false, message: 'incorrect Otp'});
      }
    } catch (error) {
      res.status(500).json({message: 'Internal server error'});
    }
  },

};

module.exports= obj;
