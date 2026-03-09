const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const region = process.env.AWS_REGION || 'us-east-1';

// DynamoDB Client
// DynamoDB Client configuration
const dynamoDBClientConfig = {
  region,
};

// Add endpoint for local testing if specified
if (process.env.DYNAMODB_ENDPOINT) {
  dynamoDBClientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
}

// For local testing without real AWS credentials
if (process.env.USE_LOCAL_DYNAMODB === 'true' || process.env.DYNAMODB_ENDPOINT) {
  dynamoDBClientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
  };
}

const dynamoDBClient = new DynamoDBClient(dynamoDBClientConfig);
// DynamoDB Document Client (easier to work with)
const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
});

// S3 Client
const s3Client = new S3Client({
  region,
});

module.exports = {
  dynamoDBClient,
  docClient,
  s3Client,
  region,
};
