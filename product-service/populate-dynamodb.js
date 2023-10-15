const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "us-east-1" }); // Replace "your-region" with your AWS region

const products = [
    {
        id: "44084a14-6709-4327-808c-986c35662f60",
        title: "Lonesome Dove",
        author: "Larry McMurtry",
        price: 10.95,
    },
    {
        id: "74b8c739-dedc-4a5e-84f9-405e774419b8",
        title: "Blood Meridian",
        author: "Kormak McCarthy",
        price: 14.50,
    },
    {
        id: "08e7437b-8882-46c6-861c-3cb0308cdd6c",
        title: "The Virginian",
        author: "Oven Wister",
        price: 9.99,
    },
    {
        id: "5f317ac0-fafb-4c4c-8385-b3df96027337",
        title: "Butcher’s Crossing",
        author: "John Williams",
        price: 11.25,
    },
    {
        id: "165f0f66-81aa-4752-9e15-d6115b6735b7",
        title: "True Grit",
        author: "Charles Portis",
        price: 11.25,
    },
];

const stock = [
    {
        product_id: "44084a14-6709-4327-808c-986c35662f60",
        count: 3,
    },
    {
        product_id: "74b8c739-dedc-4a5e-84f9-405e774419b8",
        count: 8,
    },
    {
        product_id: "08e7437b-8882-46c6-861c-3cb0308cdd6c",
        count: 2,
    },
    {
        product_id: "5f317ac0-fafb-4c4c-8385-b3df96027337",
        count: 7,
    },
    {
        product_id: "165f0f66-81aa-4752-9e15-d6115b6735b7",
        count: 7,
    },
];

const insertData = async (tableName, data) => {
	const params = {
	  TableName: tableName,
	  Item: marshall(data), // Marshall the data
	};
  
	try {
	  await client.send(new PutItemCommand(params));
	  console.log(`Inserted data into ${tableName}`);
	} catch (error) {
	  console.error(`Error inserting data into ${tableName}:`, error);
	}
  };
  

// products.forEach((product) => insertData('products', product));
stock.forEach((stockData) => insertData('stockDataTable', stockData));
