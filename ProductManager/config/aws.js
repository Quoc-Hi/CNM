const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// DynamoDB
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// S3
const s3 = new AWS.S3();

module.exports = { dynamoDB, s3 };