const products = [
  {
    id: "1",
    title: "Book 1",
    author: "Author 1",
    price: 12.99,
    count: 5,
  },
  {
    id: "2",
    title: "Book 2",
    author: "Author 2",
    price: 10.95,
    count: 3,
  },
  {
    id: "3",
    title: "Book 3",
    author: "Author 3",
    price: 14.50,
    count: 8,
  },
  {
    id: "4",
    title: "Book 4",
    author: "Author 4",
    price: 9.99,
    count: 2,
  },
  {
    id: "5",
    title: "Book 5",
    author: "Author 5",
    price: 11.25,
    count: 7,
  },
];

module.exports.getProductsList = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(products),
  };
};

module.exports.getProductsById = async (event) => {
  const productId = event.pathParameters.productId; 
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return {
      statusCode: 404, // Product not found
      body: JSON.stringify({ message: "Product not found" }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(product),
  };
}

