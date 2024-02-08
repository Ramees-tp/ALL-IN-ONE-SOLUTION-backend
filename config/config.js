const mongoose = require("mongoose");
require('dotenv').config()

const connect = mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("mongo is started");
  })
  .catch((err) => {
    console.log("mongo connection error:",err);
    process.exit(1);
  });
module.exports = connect;

