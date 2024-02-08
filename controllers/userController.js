const userDetails = require("../models/userDetails");
const bcrypt = require("bcrypt");

let obj = {
  signUp: async (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body);

    try {
      const existUser = await userDetails.findOne({ email });
      if (!existUser) {
        const hashedPass = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        const newUser = new userDetails({
          username,
          email,
          password: hashedPass,
        });
        await newUser.save();
        return res
          .status(200)
          .json({ message: "User registered successfully" });
      } else {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }
    } catch (error) {
      console.error("Error during signUp:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  login: async (req, res) => {
    const {username, password} = req.body;
    console.log(req.body);

    try {
      const existUser = await userDetails.findOne({ username });
      if (existUser) {
        const checkPass = bcrypt.compareSync(password, existUser.password);
        if (checkPass) {
          return res
            .status(200)
            .json({ message: "User logged in successfully" });
        }else{
          return res
          .status(400)
          .json({ message: "invalid password, try again" }); 
        }
      } else {
        return res
          .status(400)
          .json({ message: "User with this Username don't exists" });
      }
    } catch (err) {}
  },
};

module.exports = obj;

