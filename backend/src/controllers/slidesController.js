const driveApi = require('../api/drive');

class SlidesController {
  constructor(auth) {
    this.auth = auth;
  }

  async getPresentations() {
    return driveApi.listFiles(this.auth, 'application/vnd.google-apps.presentation');
  }

  async getPresentationMetadata(fileId) {
    return driveApi.getFileMetadata(this.auth, fileId);
  }

  async exportPresentation(fileId) {
    try {
      const pdfBuffer = await driveApi.exportSlides(this.auth, fileId);
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error exporting presentation:', error);
      return null;
    }
  }
}

module.exports = SlidesController;