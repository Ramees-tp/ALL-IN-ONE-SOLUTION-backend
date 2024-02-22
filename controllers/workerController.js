const WorkerDetails = require('../models/workerRegistration');
const bcrypt = require('bcrypt');

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

        return res.status(200).json({message: 'worker registration success'});
      }
    } catch (error) {
      console.error('Error during signUp:', error);
      res.status(500).json({message: 'Internal server error'});
    }
  },
};

module.exports= obj;
