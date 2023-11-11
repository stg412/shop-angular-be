const { GITHUB_ACCOUNT_LOGIN, TEST_PASSWORD } = process.env;

module.exports.basicAuthorizer= async (event) => {
  console.log('event :', event,  JSON.stringify(event));
  const authHeader = event.headers.Authorization;

  if (!authHeader || event.type !== "REQUEST") {
    return "Unauthorized";
  }

  const getPolicy = (principalId, effect) => ({
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: `arn:aws:execute-api:*:*:*`,
        },
      ],
    },
  });

  const authTokenEncoded = authHeader.split(" ")[1];
  const authTokenDecoded = Buffer.from(authTokenEncoded, "base64").toString(
    "ascii"
  );
  const username = authTokenDecoded.split(":")[0];
  const password = authTokenDecoded.split(":")[1];
  const expectedUsername = GITHUB_ACCOUNT_LOGIN;
  const expectedPassword = TEST_PASSWORD;

  if (username === expectedUsername && password === expectedPassword) {
    return getPolicy(username, "Allow");
  } else {
    return getPolicy(username, "Deny");
  }
};

