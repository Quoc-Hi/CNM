const { PutCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb")
const db = require("../config/dynamodb")

const table = "Products"

exports.getAll = async () => {
  const data = await db.send(new ScanCommand({ TableName: table }))
  return data.Items
}

exports.create = async (product) => {
  await db.send(new PutCommand({
    TableName: table,
    Item: product
  }))
}

exports.delete = async (id) => {
  await db.send(new DeleteCommand({
    TableName: table,
    Key: { id }
  }))
}