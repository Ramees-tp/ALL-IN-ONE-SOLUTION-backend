const workerDetails = require('../models/workerRegistration');
const JobForm = require('../models/workSchema');
// const twilioOtp = require('../utils/twilio');
const sendEmail = require('../utils/nodemailer');
const obj = {
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
      console.error('Error fetching workers:', error);
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
      console.error('Error approving worker access:', error);
      res.status(500).json({error: 'Internal server error'});
    }
  },
  rejectAccess: (req, res) => {
    // const id = req.params.id;
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
      console.error('Error approving worker access:', error);
      res.status(500).json({error: 'internal server error'});
    }
  },
  addJobType: async (req, res) => {
    try {
      const {jobName, jobDescription} = req.body;

      if (!req.file || !req.file.location) {
        return res.status(400).json({error: 'Invalid file uploaded'});
      }
      const image = req.file.location;
      console.log('Image uploaded successfully:', image);

      const newForm= new JobForm({
        jobName,
        jobDescription,
        jobImage: image,
      });
      await newForm.save();

      res
          .status(200)
          .json({message: 'Job type added successfully', imageUrl: image});
    } catch (error) {
      console.error('Error adding job type:', error);
      res.status(500).json({error: 'Internal Server Error'});
    }
  },
};

module.exports = obj;
