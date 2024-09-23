const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const drive = google.drive({ version: 'v3' });
const sheets = google.sheets({ version: 'v4' });

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

async function downloadSheet(auth, fileId, range) {
  const res = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId: fileId,
    range,
  });
  return res.data.values || [];
}

async function exportSlides(auth, fileId) {
  const res = await drive.files.export({
    auth,
    fileId,
    mimeType: 'application/pdf',
  }, { responseType: 'arraybuffer' });
  return res.data;
}

module.exports = {
  listFiles,
  getFileMetadata,
  downloadSheet,
  exportSlides
};