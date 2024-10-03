const { google } = require('googleapis');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
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
  getSpreadsheets,
  getPresentations,
};