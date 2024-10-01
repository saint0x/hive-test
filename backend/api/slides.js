const { google } = require('googleapis');

async function createPlaceholder(auth, presentationId, pageId, placeholderType, x, y, width, height) {
  const slides = google.slides({ version: 'v1', auth });

  try {
    const response = await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests: [{
          createShape: {
            objectId: `placeholder_${Date.now()}`,
            shapeType: placeholderType === 'IMAGE' ? 'IMAGE' : 'TEXT_BOX',
            elementProperties: {
              pageObjectId: pageId,
              size: { width: { magnitude: width, unit: 'PT' }, height: { magnitude: height, unit: 'PT' } },
              transform: { scaleX: 1, scaleY: 1, translateX: x, translateY: y, unit: 'PT' }
            }
          }
        }]
      }
    });

    return response.data.replies[0].createShape.objectId;
  } catch (error) {
    console.error('Error creating placeholder:', error);
    throw new Error(`Failed to create placeholder: ${error.message}`);
  }
}

async function updateSlideText(auth, presentationId, pageId, elementId, text) {
  const slides = google.slides({ version: 'v1', auth });

  try {
    // First, get the current text style
    const element = await slides.presentations.pages.get({
      presentationId: presentationId,
      pageObjectId: pageId,
      elementObjectId: elementId,
    });

    const currentStyle = element.data.pageElements[0].shape.text.textElements[0].textRun.style;

    // Now update the text while preserving the style
    await slides.presentations.batchUpdate({
      presentationId: presentationId,
      requestBody: {
        requests: [{
          deleteText: {
            objectId: elementId,
            textRange: {
              type: 'ALL'
            }
          }
        }, {
          insertText: {
            objectId: elementId,
            insertionIndex: 0,
            text: text
          }
        }, {
          updateTextStyle: {
            objectId: elementId,
            style: currentStyle,
            textRange: {
              type: 'ALL'
            },
            fields: 'foregroundColor,fontFamily,fontSize,bold,italic,underline'
          }
        }]
      }
    });
  } catch (error) {
    console.error('Error updating slide text:', error);
    throw new Error(`Failed to update slide text: ${error.message}`);
  }
}

async function createSlide(auth, presentationId) {
  const slides = google.slides({ version: 'v1', auth });

  try {
    const response = await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests: [{
          createSlide: {
            insertionIndex: '1',
            slideLayoutReference: { predefinedLayout: 'BLANK' }
          }
        }]
      }
    });

    return response.data.replies[0].createSlide.objectId;
  } catch (error) {
    console.error('Error creating slide:', error);
    throw new Error(`Failed to create slide: ${error.message}`);
  }
}

module.exports = {
  createPlaceholder,
  updateSlideText,
  createSlide,
};