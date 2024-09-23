const { google } = require('googleapis');

async function getSpreadsheetValues(auth, spreadsheetId, range) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Format the range correctly
  const formattedRange = formatRange(range);

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: formattedRange,
    });
    return response.data.values;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw new Error(`Failed to fetch sheet data: ${error.message}`);
  }
}

function formatRange(range) {
  // If the range contains a hyphen, replace it with a colon
  if (range.includes('-')) {
    const [sheet, cells] = range.split('!');
    const [start, end] = cells.split('-');
    return `${sheet}!${start}:${end}`;
  }
  return range;
}

module.exports = { getSpreadsheetValues };