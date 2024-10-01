const { google } = require('googleapis');

async function getSpreadsheetValues(auth, spreadsheetId, range) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.data.values;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw new Error(`Failed to fetch sheet data: ${error.message}`);
  }
}

async function updateSpreadsheetValues(auth, spreadsheetId, range, values) {
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating sheet data:', error);
    throw new Error(`Failed to update sheet data: ${error.message}`);
  }
}

module.exports = {
  getSpreadsheetValues,
  updateSpreadsheetValues,
};