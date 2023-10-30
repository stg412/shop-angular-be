const AWS = require("aws-sdk");
const s3 = new AWS.S3()
const csv = require("csv-parser");

module.exports.importFileParser = async (event)=>  {
  try {
      const params = {
          Bucket: event.Records[0].s3.bucket.name,
          Key: event.Records[0].s3.object.key,
      };

      await new Promise((resolve, reject) => {
          s3.getObject(params)
              .createReadStream()
              .pipe(csv())
              .on('data', data => {
                  console.info('CSV file data:', data);
              })
              .on('error', error => {
                  reject(error.message);
              })
              .on('end', () => {
                  resolve('success');
              })
      });

  } catch (error) {
      console.log(error.message);
  }
}

// module.exports.importFileParser = async (event) => {
//   const bucketName = "module-5-upload-s3"; // Change this to your S3 bucket name

//   for (const record of event.Records) {
//     const params = {
//       Bucket: bucketName,
//       Key: record.s3.object.key,
//     };

//     try {
//       const getObjectCommand = new GetObjectCommand(params);
//       const response = await s3Client.send(getObjectCommand);

//       if (response.Body) {
//         response.Body.pipe(csv()).on("data", (data) => {
//           console.log("Parsed data:", data);
//         });
//       } else {
//         console.error("No response body found.");
//       }
//     } catch (error) {
//       console.error("Error fetching S3 object:", error);
//     }
//   }
// };

// module.exports.importFileParser = async (event) => {
//     for (const record of event.Records) {
//       const params = {
//         Bucket: "module-5-upload-s3",
//         Key: record.s3.object.key,
//       };

//       const s3Stream = await s3.getObject(params).createReadStream();

//       s3Stream
//         .pipe(csv())
//         .on("data", (data) => {
//           console.error("Parsed data:", data);
//         })
//         .on("end", () => {
//           console.error("CSV parsing finished.");
//         })
//         .on("error", (error) => {
//           console.error("Error while parsing CSV:", error);
//         });
//     }
// };

module.exports.importProductsFile = async (event) => {
  const { name } = event.queryStringParameters;

  // Generate a Signed URL for the S3 object
  const signedUrl = await s3.getSignedUrlPromise("putObject", {
    Bucket: "module-5-upload-s3",
    Key: `uploaded/${name}`,
    Expires: 60, // URL expiration time in seconds
  });

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({ url: signedUrl }),
  };
};
