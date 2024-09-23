const { google } = require('googleapis');

async function createPlaceholder(auth, presentationId, pageId, placeholderType, selectedBlocks) {
  const slides = google.slides({ version: 'v1', auth });

  // Define the grid
  const gridSize = 3;
  const blockWidth = 200;
  const blockHeight = 100;
  const spacing = 10;

  // Calculate the position and size of the placeholder based on selected blocks
  let { x, y, width, height } = calculatePlaceholderDimensions(selectedBlocks, gridSize, blockWidth, blockHeight, spacing);

  try {
    // First, verify that the presentation exists
    await slides.presentations.get({ presentationId });

    const response = await slides.presentations.batchUpdate({
      presentationId: presentationId,
      requestBody: {
        requests: [{
          createShape: {
            objectId: `placeholder_${Date.now()}`,
            shapeType: placeholderType === 'IMAGE' ? 'IMAGE' : 'TEXT_BOX',
            elementProperties: {
              pageObjectId: pageId,
              size: {
                width: { magnitude: width, unit: 'PT' },
                height: { magnitude: height, unit: 'PT' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: x,
                translateY: y,
                unit: 'PT'
              }
            }
          }
        }]
      }
    });

    return response.data.replies[0].createShape.objectId;
  } catch (error) {
    console.error('Error creating placeholder:', error);
    if (error.response && error.response.status === 404) {
      throw new Error(`Presentation not found: ${presentationId}`);
    }
    throw new Error(`Failed to create placeholder: ${error.message}`);
  }
}

function calculatePlaceholderDimensions(selectedBlocks, gridSize, blockWidth, blockHeight, spacing) {
  if (!Array.isArray(selectedBlocks) || selectedBlocks.length === 0) {
    // Default to a single block if selectedBlocks is not an array or is empty
    return { x: 0, y: 0, width: blockWidth, height: blockHeight };
  }

  const minX = Math.min(...selectedBlocks.map(block => block % gridSize));
  const maxX = Math.max(...selectedBlocks.map(block => block % gridSize));
  const minY = Math.min(...selectedBlocks.map(block => Math.floor(block / gridSize)));
  const maxY = Math.max(...selectedBlocks.map(block => Math.floor(block / gridSize)));

  const x = minX * (blockWidth + spacing);
  const y = minY * (blockHeight + spacing);
  const width = (maxX - minX + 1) * blockWidth + (maxX - minX) * spacing;
  const height = (maxY - minY + 1) * blockHeight + (maxY - minY) * spacing;

  return { x, y, width, height };
}

async function updateSlideText(auth, presentationId, pageId, elementId, text) {
  const slides = google.slides({ version: 'v1', auth });

  try {
    await slides.presentations.batchUpdate({
      presentationId: presentationId,
      requestBody: {
        requests: [{
          insertText: {
            objectId: elementId,
            insertionIndex: 0,
            text: text
          }
        }]
      }
    });
  } catch (error) {
    console.error('Error updating slide text:', error);
    if (error.response && error.response.status === 404) {
      throw new Error(`Presentation not found: ${presentationId}`);
    }
    throw new Error(`Failed to update slide text: ${error.message}`);
  }
}

async function updateSlideImage(auth, presentationId, pageId, elementId, imageUrl) {
  const slides = google.slides({ version: 'v1', auth });

  try {
    await slides.presentations.batchUpdate({
      presentationId: presentationId,
      requestBody: {
        requests: [{
          replaceImage: {
            imageObjectId: elementId,
            imageReplaceMethod: 'CENTER_INSIDE',
            url: imageUrl
          }
        }]
      }
    });
  } catch (error) {
    console.error('Error updating slide image:', error);
    if (error.response && error.response.status === 404) {
      throw new Error(`Presentation not found: ${presentationId}`);
    }
    throw new Error(`Failed to update slide image: ${error.message}`);
  }
}

async function updatePlaceholder(auth, presentationId, pageId, elementId, x, y, width, height) {
  const slides = google.slides({ version: 'v1', auth });

  try {
    await slides.presentations.batchUpdate({
      presentationId: presentationId,
      requestBody: {
        requests: [{
          updatePageElementTransform: {
            objectId: elementId,
            applyMode: 'ABSOLUTE',
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: x,
              translateY: y,
              unit: 'PT'
            }
          }
        }, {
          updatePageElementTransform: {
            objectId: elementId,
            applyMode: 'ABSOLUTE',
            transform: {
              scaleX: width / 100,  // Assuming initial width was 100
              scaleY: height / 100, // Assuming initial height was 100
              unit: 'PT'
            }
          }
        }]
      }
    });
  } catch (error) {
    console.error('Error updating placeholder:', error);
    if (error.response && error.response.status === 404) {
      throw new Error(`Presentation not found: ${presentationId}`);
    }
    throw new Error(`Failed to update placeholder: ${error.message}`);
  }
}

async function getSlidePageId(auth, presentationId, pageIndex = 0) {
  const slides = google.slides({ version: 'v1', auth });

  try {
    const presentation = await slides.presentations.get({
      presentationId: presentationId
    });

    if (presentation.data.slides && presentation.data.slides.length > pageIndex) {
      return presentation.data.slides[pageIndex].objectId;
    } else {
      throw new Error(`Slide at index ${pageIndex} not found`);
    }
  } catch (error) {
    console.error('Error getting slide page ID:', error);
    if (error.response && error.response.status === 404) {
      throw new Error(`Presentation not found: ${presentationId}`);
    }
    throw new Error(`Failed to get slide page ID: ${error.message}`);
  }
}

async function verifyPresentation(auth, presentationId) {
  const slides = google.slides({ version: 'v1', auth });

  try {
    await slides.presentations.get({ presentationId });
    return true;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    throw error;
  }
}

module.exports = {
  createPlaceholder,
  updateSlideText,
  updateSlideImage,
  updatePlaceholder,
  getSlidePageId,
  verifyPresentation
};