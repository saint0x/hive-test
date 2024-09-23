const driveApi = require('../api/drive');

class SheetsController {
  constructor(auth) {
    this.auth = auth;
  }

  async getSpreadsheets() {
    return driveApi.listFiles(this.auth, 'application/vnd.google-apps.spreadsheet');
  }

  async getSpreadsheetMetadata(fileId) {
    return driveApi.getFileMetadata(this.auth, fileId);
  }

  async getSpreadsheetValues(fileId, range) {
    return driveApi.downloadSheet(this.auth, fileId, range);
  }
}

module.exports = SheetsController;