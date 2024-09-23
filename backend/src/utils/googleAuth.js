const { google } = require('googleapis');

// Hardcoded secrets (Note: This is not recommended for production use)
const CLIENT_ID = '1027395944679-049n69bno5mi3127jco9vj1l4ingv34s.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/presentations.readonly'
    ],
  });
}

async function getTokenFromCode(code) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

async function getUserInfo(accessToken) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  return data;
}

async function getSpreadsheets(auth) {
  const drive = google.drive({ version: 'v3', auth });
  const response = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    fields: 'files(id, name)',
  });
  return response.data.files;
}

async function getPresentations(auth) {
  const drive = google.drive({ version: 'v3', auth });
  const response = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.presentation'",
    fields: 'files(id, name)',
  });
  return response.data.files;
}

module.exports = {
  oauth2Client,
  getAuthUrl,
  getTokenFromCode,
  getUserInfo,
  getSpreadsheets,
  getPresentations,
};