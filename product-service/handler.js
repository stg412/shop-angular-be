const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

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