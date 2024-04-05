const express = require('express');
const app = express();
const port = 9170;
const userRouter = require('./routes/userRoutes');
const workerRouter=require('./routes/workerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mongConnect = require('./config/config');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
// app.use(cors({origin: ['http://localhost:5173'], credentials: true}));
app.use(cors({origin: ['http://184.73.25.154'], credentials: true}));

app.use('/user', userRouter);
app.use('/worker', workerRouter);
app.use('/master', adminRoutes);

mongConnect.then(() => {
  console.log('MongoDB database connected successfully');
  app.listen(port, () => {
    console.log(`server is rinning at http://localhost:${port}`);
  });
}).catch((error)=>{
  console.log('Error while connecting to mongoDB', error);
  console.log('MongoDB database is not connected');
  process.exit(1);
});
