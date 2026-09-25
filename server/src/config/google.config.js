const {
  OAuth2Client,
} = require("google-auth-library");

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
];

const getGoogleConfig = () => {
  const required = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
  ];

  const missing = required.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing Google OAuth configuration: ${missing.join(", ")}`
    );
  }

  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret:
      process.env.GOOGLE_CLIENT_SECRET,
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI,
  };
};

const createGoogleClient = () => {
  const config = getGoogleConfig();

  return new OAuth2Client(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );
};

const getGoogleAuthUrl = ({
  state,
  codeChallenge,
  nonce,
}) => {
  const config = getGoogleConfig();

  const client = createGoogleClient();

  return client.generateAuthUrl({
    access_type: "online",

    scope: GOOGLE_SCOPES,

    include_granted_scopes: true,

    prompt: "select_account",

    state,

    code_challenge: codeChallenge,

    code_challenge_method: "S256",

    nonce,

    client_id: config.clientId,

    redirect_uri: config.redirectUri,
  });
};

const exchangeGoogleCode = async ({
  code,
  codeVerifier,
}) => {
  const config = getGoogleConfig();

  const client = createGoogleClient();

  const { tokens } =
    await client.getToken({
      code,

      codeVerifier,

      redirect_uri:
        config.redirectUri,
    });

  if (!tokens.id_token) {
    throw new Error(
      "Google did not return an ID token"
    );
  }

  const ticket =
    await client.verifyIdToken({
      idToken: tokens.id_token,

      audience: config.clientId,
    });

  return ticket.getPayload();
};

module.exports = {
  getGoogleAuthUrl,
  exchangeGoogleCode,
};