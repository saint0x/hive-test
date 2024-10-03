import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

export async function getSpreadsheets(auth: any) {
  const drive = google.drive({ version: 'v3', auth });
  const response = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    fields: 'files(id, name)',
  });
  return response.data.files;
}

export async function getPresentations(auth: any) {
  const drive = google.drive({ version: 'v3', auth });
  const response = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.presentation'",
    fields: 'files(id, name)',
  });
  return response.data.files;
}

export async function getTokenFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// ... other necessary functions