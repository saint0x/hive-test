const { OAuth2Client } = require('google-auth-library');

const credentials = {
  client_id: '1027395944679-049n69bno5mi3127jco9vj1l4ingv34s.apps.googleusercontent.com',
  client_secret: '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',
  redirect_uri: 'http://localhost:3000/api/auth/callback/google'
};

const oauth2Client = new OAuth2Client(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uri
);

function setCredentials(tokens) {
  oauth2Client.setCredentials(tokens);
}

module.exports = {
  oauth2Client,
  setCredentials
};