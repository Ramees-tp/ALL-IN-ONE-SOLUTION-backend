const express = require("express");
const router = express.Router();

const { signUp, login, userOTP, verifyOTP, resetPass } = require("../controllers/userController");


router.post("/signUp", signUp);
router.post("/login",login)
router.post("/userOTP",userOTP)
router.post("/verifyOTP",verifyOTP)
router.post("/resetPass",resetPass)

module.exports = router;
