require('dotenv').config();
const {S3Client} = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretKey = process.env.S3_SECRET_KEY;
const region = process.env.REGION;
const myBucket = process.env.BUCKET_NAME;
const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretKey,
  },
});
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: myBucket,
    metadata: function(req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function(req, file, cb) {
      const fileType = file
          .fieldname === 'profileImage' ? 'profileImage' :
           'jobImage' ? 'jobImage' : 'userImage';
      const timestamp = Date.now();
      cb(null, `${fileType}-${timestamp}.jpeg`);
    },
  }),
});
module.exports = {upload, s3};

