const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true,
});

module.exports = s3;
