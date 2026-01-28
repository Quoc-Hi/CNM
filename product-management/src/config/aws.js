require("dotenv").config();

module.exports = {
  region: process.env.AWS_REGION,
  tableName: process.env.DYNAMO_TABLE,
  bucketName: process.env.S3_BUCKET,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};
