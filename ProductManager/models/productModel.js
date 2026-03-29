const { dynamoDB } = require('../config/aws');
const TABLE = process.env.DYNAMODB_TABLE_NAME || 'Products';

exports.getAll = async (search = "") => {
  const params = { TableName: TABLE };
  if (search) {
    params.FilterExpression = "contains(#n, :s)";
    params.ExpressionAttributeNames = { "#n": "name" };
    params.ExpressionAttributeValues = { ":s": search };
  }
  const data = await dynamoDB.scan(params).promise();
  if (data.Items) {
    data.Items = data.Items.map(item => ({ ...item, id: item.ID || item.id }));
  }
  return data;
};

exports.getById = async (id) => {
  const data = await dynamoDB.get({ TableName: TABLE, Key: { ID: id } }).promise();
  if (data.Item) {
    data.Item.id = data.Item.ID || data.Item.id;
  }
  return data;
};

exports.create = (item) => {
  const dbItem = { ...item, ID: item.id || item.ID };
  return dynamoDB.put({ TableName: TABLE, Item: dbItem }).promise();
};

exports.update = (id, data) =>
  dynamoDB.update({
    TableName: TABLE,
    Key: { ID: id },
    UpdateExpression:
      "set #n=:n, price=:p, unit_in_stock=:u, url_image=:img",
    ExpressionAttributeNames: { "#n": "name" },
    ExpressionAttributeValues: {
      ":n": data.name,
      ":p": data.price,
      ":u": data.unit_in_stock,
      ":img": data.url_image
    }
  }).promise();

exports.delete = (id) =>
  dynamoDB.delete({ TableName: TABLE, Key: { ID: id } }).promise();