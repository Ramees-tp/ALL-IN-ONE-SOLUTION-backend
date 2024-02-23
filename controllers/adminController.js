const workerDetails = require('../models/workerRegistration');

const obj = {
  workerRequest: async (req, res) => {
    try {
      const forApproval = await workerDetails.find({isApproved: false});
      res
          .status(200)
          .json({data: forApproval, message: 'Data fetch success'});
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
        return res.status(404).json({message: 'worker not found'});
      } else {
        worker.isApproved = true;
        await worker.save();
        return res.status(200).json({message: 'given access to worker'});
      }
    } catch (error) {
      console.error('Error approving worker access:', error);
      res.status(500).json({error: 'Internal server error'});
    }
  },
  rejectAccess: (req, res) => {
    // const id = req.params.id;
  },
};

module.exports = obj;
