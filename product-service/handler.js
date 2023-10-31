const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
const SNS_TOPIC_ARN = "arn:aws:sns:us-east-1:948204824271:createProductTopic";

const scan = async (tableName) => {
  const scanResults = await dynamo.scan({
    TableName: tableName,
  }).promise();
  return scanResults.Items;
}

const getStockData = async (products) => {
  const stockResults = await scan(process.env.STOCKS_TABLE);
  const stockData = stockResults.reduce((acc, item) => {
    acc[item.product_id] = item;
    return acc;
  }, {});
  return products.map((product) => ({
    id: product.id,
    count: stockData[product.id]?.count || 0,
    price: product.price,
    title: product.title,
    author: product.author,
  }));
};

module.exports.getProductsList = async (event) => {
  try {
    const products = await scan(process.env.PRODUCTS_TABLE);
    const combinedData = await getStockData(products);

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(combinedData),
    };
    return response;
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500, // Internal Server Error
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};

// GET PRODUCT BY ID

const getProductById = async (id) => {
  const productResult = await dynamo.query({
    TableName: process.env.PRODUCTS_TABLE,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': id,
    },
  }).promise();

  return productResult.Items[0]; // Assuming productId is unique.
}

const getStockCount = async (productId) => {
  const stockResult = await dynamo.query({
    TableName: process.env.STOCKS_TABLE,
    KeyConditionExpression: 'product_id = :id',
    ExpressionAttributeValues: {
      ':id': productId,
    },
  }).promise();

  return stockResult.Items[0]?.count || 0; // Assuming productId is unique.
}

module.exports.getProductsById = async (event) => {
  try {
    const productId = event.pathParameters.productId;
    const product = await getProductById(productId);

    if (!product) {
      return {
        statusCode: 404, // Product not found
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    const stockCount = await getStockCount(productId);

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        id: product.id,
        count: stockCount,
        price: product.price,
        title: product.title,
        author: product.author
      }),
    };
    return response;
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500, // Internal Server Error
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};

// CREATE PRODUCT

module.exports.createProduct = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);

    const params = {
      TableName: process.env.PRODUCTS_TABLE, 
      Item: requestBody,
    };

    await dynamo.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Product created successfully' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};


module.exports.catalogBatchProcess = async (event) => {
  try {
    const records = event.Records;

    for (const record of records) {
      const messageBody = JSON.parse(record.body);

      if (!messageBody.id) {
        // If the message does not have an ID, generate a new one
        messageBody.id = generateProductId();
      }

      const product = {
        id: messageBody.id,
        title: messageBody.title,
        author: messageBody.author,
        price: messageBody.price,
        count: messageBody.count,
      };

      await createProductInDynamoDB(product);
    }

    // Send an event to the SNS topic
    const snsMessage = "Products have been created successfully.";
    await sendEventToSNS(SNS_TOPIC_ARN, snsMessage);

    return {
      statusCode: 200,
      body: "Processed all messages successfully",
    };
  } catch (error) {
    console.error("Error processing messages:", error);
    return {
      statusCode: 500,
      body: "Error processing messages",
    };
  }
};

// Function to create a product in the DynamoDB table
const createProductInDynamoDB = async (product) => {
  const params = {
    TableName: PRODUCTS_TABLE,
    Item: product,
  };

  await dynamo.put(params).promise();
};

// Function to generate a unique product ID
const generateProductId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Function to send an event to an SNS topic
const sendEventToSNS = async (topicArn, message) => {
  const params = {
    TopicArn: topicArn,
    Message: message,
  };

  await sns.publish(params).promise();
};

// OPTION WITH MOCKED DATA - WORKING!!!

// const products = require('./products');

// module.exports.getProductsList = async (event) => {
//   return {
//     statusCode: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Credentials': true,
//     },
//     body: JSON.stringify(products),
//   };
// };

// module.exports.getProductsById = async (event) => {
//   const productId = event.pathParameters.productId; 
//   const product = products.find((p) => p.id === productId);

//   if (!product) {
//     return {
//       statusCode: 404, // Product not found
//       body: JSON.stringify({ message: "Product not found" }),
//     };
//   }

//   return {
//     statusCode: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Credentials': true,
//     },
//     body: JSON.stringify(product),
//   };
// }