const userDetails = require("../models/userDetails");
const userOTP = require("../models/userOTP");
const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");
require("dotenv").config();

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

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
    const { username, password } = req.body;
    console.log(req.body);

    try {
      const existUser = await userDetails.findOne({ username });
      if (existUser) {
        const checkPass = bcrypt.compareSync(password, existUser.password);
        if (checkPass) {
          return res
            .status(200)
            .json({ message: "User logged in successfully" });
        } else {
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
  userOTP: async (req, res) => {
    const { email } = req.body;
    try {
      const existUser = await userDetails.findOne({ email });
      if (existUser) {
        const OTP = Math.floor(100000 + Math.random() * 900000);
        const existMail = await userOTP.findOne({ email });
        if (existMail) {
          const updateData = await userOTP.findByIdAndUpdate(
            { _id: existMail._id },
            { OTP: OTP },
            { new: true }
          );
          await updateData.save();

          const mail = {
            from: process.env.EMAIL,
            to: email,
            subject: "sending OTP for authentication",
            text: `OTP:${OTP}`,
          };
          transporter.sendMail(mail, (error, info) => {
            if (error) {
              res.status(400).json({ error: "email not send" });
            } else {
              console.log("email send", info.response);
              res.status(200).json({ message: "success" });
            }
          });
        } else {
          const saveNew = new userOTP({
            email,
            OTP: OTP,
          });
          await saveNew.save();

          const mail = {
            from: process.env.EMAIL,
            to: email,
            subject: "sending email for authentication",
            text: `OTP:${OTP}`,
          };
          transporter.sendMail(mail, (error, info) => {
            if (error) {
              res.status(400).json({ error: "email not send" });
            } else {
              console.log("email send", info.response);
              res.status(200).json({ message: "success" });
            }
          });
        }
      } else {
        res.status(400).json({ error: "user with this email not exist" });
      }
    } catch (err) {
      res.status(400).json({ error: "ivalid details", err });
    }
  },
  verifyOTP: async (req, res) => {
    const { verificationId, otpValues } = req.body;
    const otp = parseInt(otpValues.join(""), 10);
    try {
      const otpPass = await userOTP.findOne({ OTP: otp });

      if (otpPass) {
        await userOTP.findOneAndUpdate({ OTP: otp },{$unset:{OTP:""}});
        return res.status(200).json({ message: "Correct OTP" });
      } else {
        return res.status(400).json({ message: "Incorrect otp" });
      }
    } catch (err) {
      res.status(500).json({ error: "Invalid OTP details", err });
    }
  },
  resetPass:async(req,res)=>{
     const{password}=req.body
  }
};

module.exports = obj;
