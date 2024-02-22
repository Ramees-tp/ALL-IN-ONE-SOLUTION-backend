const express = require('express');
const app = express();
const port = 917;
const userRouter = require('./routes/userRoutes');
const workerRouter=require('./routes/workerRoutes');
const mongConnect = require('./config/config');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors({origin: ['http://localhost:5173'], credentials: true}));


app.use('/user', userRouter);
app.use('/worker', workerRouter);

mongConnect.then(() => {
  app.listen(port, () => {
    console.log(`server is rinning at http://localhost:${port}`);
  });
}).catch((error)=>{
  console.log('Error while connecting to mongoDB', error);
  process.exit(1);
});
