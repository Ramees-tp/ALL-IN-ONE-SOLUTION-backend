const userDetails = require("../models/userDetails");

let obj = {
    signUp: async (req, res) => {
      const { username, email, password } = req.body;
      console.log(req.body);
    

      const newUser = new userDetails({
        username,
        email,
        password,
      });
      await newUser.save();
  },
};

module.exports = obj;
