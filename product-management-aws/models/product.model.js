const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const dynamoDB = require('../config/db');

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'Products';

const ProductModel = {
    getAllProducts: async () => {
        const params = { TableName: TABLE_NAME };
        const data = await dynamoDB.send(new ScanCommand(params));
        return data.Items || [];
    },

    getProductById: async (id) => {
        const params = {
            TableName: TABLE_NAME,
            Key: { ID: id }
        };
        const data = await dynamoDB.send(new GetCommand(params));
        return data.Item;
    },

    addProduct: async (product) => {
        const params = {
            TableName: TABLE_NAME,
            Item: product
        };
        await dynamoDB.send(new PutCommand(params));
        return product;
    },

    updateProduct: async (id, updates) => {
        let updateExpression = 'set ';
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        const keys = Object.keys(updates);
        if (keys.length === 0) return null;

        keys.forEach((key, index) => {
            updateExpression += `#${key} = :${key}`;
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:${key}`] = updates[key];
            if (index < keys.length - 1) updateExpression += ', ';
        });

        const params = {
            TableName: TABLE_NAME,
            Key: { ID: id },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };

        const data = await dynamoDB.send(new UpdateCommand(params));
        return data.Attributes;
    },

    deleteProduct: async (id) => {
        const params = {
            TableName: TABLE_NAME,
            Key: { ID: id }
        };
        await dynamoDB.send(new DeleteCommand(params));
        return true;
    }
};

module.exports = ProductModel;
