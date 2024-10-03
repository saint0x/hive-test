const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const drive = google.drive({ version: 'v3' });
const sheets = google.sheets({ version: 'v4' });
const slides = google.slides({ version: 'v1' });

async function listFiles(auth, mimeType) {
  const res = await drive.files.list({
    auth,
    q: `mimeType='${mimeType}'`,
    fields: 'files(id, name, mimeType, thumbnailLink)',
  });
  return res.data.files || [];
}

async function getFileMetadata(auth, fileId) {
  const res = await drive.files.get({
    auth,
    fileId,
    fields: 'id, name, mimeType, createdTime, modifiedTime, owners, thumbnailLink',
  });
  return res.data;
}

async function getSpreadsheetData(auth, fileId, range) {
  const res = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId: fileId,
    range,
  });
  return res.data.values || [];
}

async function getPresentationData(auth, fileId) {
  const res = await slides.presentations.get({
    auth,
    presentationId: fileId,
  });
  return res.data;
}

module.exports = {
  listFiles,
  getFileMetadata,
  getSpreadsheetData,
  getPresentationData
};