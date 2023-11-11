const { GITHUB_ACCOUNT_LOGIN, TEST_PASSWORD } = process.env;

module.exports.basicAuthorizer= async (event) => {
  const authorizationToken = event.authorizationToken;

  if (!authorizationToken) {
    // Return a 401 Unauthorized status if the Authorization header is not provided
    return {
      statusCode: 401,
      body: 'Unauthorized from handler',
    };
  }

  // Decode the Basic Authorization token
  const encodedCreds = authorizationToken.split(' ')[1];
  const decodedCreds = Buffer.from(encodedCreds, 'base64').toString('utf-8');

  // Parse the decoded credentials
  const [username, password] = decodedCreds.split(':');

  const expectedUsername = GITHUB_ACCOUNT_LOGIN;
  const expectedPassword = TEST_PASSWORD;

  // Check if the provided credentials match the environment variables
  if (username === expectedUsername && password === expectedPassword) {
    // Return a 200 OK status if access is granted
    return {
      statusCode: 200,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      },
    };
  }

  // Return a 403 Forbidden status with an explicit Deny effect
  return {
    statusCode: 403,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Deny',
          Resource: event.methodArn,
        },
      ],
    },
    body: 'Access Denied from handler',
  };
};

