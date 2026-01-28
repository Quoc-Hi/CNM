const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const aws = require("../config/aws");

const ddbClient = new DynamoDBClient({
  region: aws.region,
  credentials: aws.credentials,
});

const docClient = DynamoDBDocumentClient.from(ddbClient);

async function createProduct(item) {
  await docClient.send(
    new PutCommand({
      TableName: aws.tableName,
      Item: item,
    })
  );
}

async function listProducts() {
  const res = await docClient.send(
    new ScanCommand({ TableName: aws.tableName })
  );
  return res.Items || [];
}

async function getProductById(id) {
  const res = await docClient.send(
    new GetCommand({
      TableName: aws.tableName,
      Key: { id },
    })
  );
  return res.Item;
}

async function updateProduct(id, data) {
  const fields = ["name", "price", "quantity", "url_image"];
  const setParts = [];
  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};

  fields.forEach((f) => {
    if (data[f] !== undefined && data[f] !== null) {
      setParts.push(`#${f} = :${f}`);
      ExpressionAttributeNames[`#${f}`] = f;
      ExpressionAttributeValues[`:${f}`] = data[f];
    }
  });

  if (setParts.length === 0) return;

  await docClient.send(
    new UpdateCommand({
      TableName: aws.tableName,
      Key: { id },
      UpdateExpression: "SET " + setParts.join(", "),
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    })
  );
}

async function deleteProduct(id) {
  await docClient.send(
    new DeleteCommand({
      TableName: aws.tableName,
      Key: { id },
    })
  );
}

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
