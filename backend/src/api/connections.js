const { google } = require('googleapis');
const sheetsApi = require('./sheets');
const slidesApi = require('./slides');

// This would typically be stored in a database
let connections = [];

async function createConnection(
  auth,
  sheetId,
  slideId,
  sheetRange,
  slidePageId,
  blocks,
  isImage
) {
  try {
    const placeholderType = isImage ? 'IMAGE' : 'TEXT_BOX';
    let x = 0, y = 0, width = 200, height = 100;

    if (blocks && Array.isArray(blocks) && blocks.length > 0) {
      const dimensions = calculatePlaceholderDimensions(blocks);
      x = dimensions.x;
      y = dimensions.y;
      width = dimensions.width;
      height = dimensions.height;
    }
    
    const slideElementId = await slidesApi.createPlaceholder(
      auth, 
      slideId, 
      slidePageId, 
      placeholderType, 
      blocks
    );

    const connection = {
      id: `connection_${Date.now()}`,
      sheetId,
      slideId,
      sheetRange,
      slidePageId,
      slideElementId,
      blocks: blocks || [],
      isImage,
    };

    connections.push(connection);

    // Perform initial sync
    await syncConnection(auth, connection);

    return connection;
  } catch (error) {
    console.error('Error creating connection:', error);
    throw new Error(`Failed to create connection: ${error.message}`);
  }
}

async function syncConnection(auth, connection) {
  try {
    const sheetValues = await sheetsApi.getSpreadsheetValues(auth, connection.sheetId, connection.sheetRange);
    
    if (connection.isImage) {
      // Assuming the cell contains an image URL
      const imageUrl = sheetValues[0][0];
      await slidesApi.updateSlideImage(auth, connection.slideId, connection.slidePageId, connection.slideElementId, imageUrl);
    } else {
      const content = sheetValues.map(row => row.join(' ')).join('\n');
      await slidesApi.updateSlideText(auth, connection.slideId, connection.slidePageId, connection.slideElementId, content);
    }
  } catch (error) {
    console.error('Error syncing connection:', error);
    throw new Error(`Failed to sync connection: ${error.message}`);
  }
}

async function syncAllConnections(auth) {
  for (const connection of connections) {
    await syncConnection(auth, connection);
  }
}

function getConnections() {
  return connections;
}

function deleteConnection(connectionId) {
  const index = connections.findIndex(conn => conn.id === connectionId);
  if (index !== -1) {
    connections.splice(index, 1);
    return true;
  }
  return false;
}

function calculatePlaceholderDimensions(blocks) {
  const gridSize = 3;
  const blockWidth = 200;
  const blockHeight = 100;
  const spacing = 10;

  const minX = Math.min(...blocks.map(block => block % gridSize));
  const maxX = Math.max(...blocks.map(block => block % gridSize));
  const minY = Math.min(...blocks.map(block => Math.floor(block / gridSize)));
  const maxY = Math.max(...blocks.map(block => Math.floor(block / gridSize)));

  const x = minX * (blockWidth + spacing);
  const y = minY * (blockHeight + spacing);
  const width = (maxX - minX + 1) * blockWidth + (maxX - minX) * spacing;
  const height = (maxY - minY + 1) * blockHeight + (maxY - minY) * spacing;

  return { x, y, width, height };
}

async function updateConnection(auth, connectionId, updates) {
  const connectionIndex = connections.findIndex(conn => conn.id === connectionId);
  if (connectionIndex === -1) {
    throw new Error('Connection not found');
  }

  const connection = connections[connectionIndex];
  const updatedConnection = { ...connection, ...updates };

  if (updates.blocks && Array.isArray(updates.blocks) && updates.blocks.length > 0) {
    const { x, y, width, height } = calculatePlaceholderDimensions(updates.blocks);
    await slidesApi.updatePlaceholder(
      auth,
      updatedConnection.slideId,
      updatedConnection.slidePageId,
      updatedConnection.slideElementId,
      x,
      y,
      width,
      height
    );
  }

  connections[connectionIndex] = updatedConnection;
  await syncConnection(auth, updatedConnection);

  return updatedConnection;
}

module.exports = {
  createConnection,
  syncConnection,
  syncAllConnections,
  getConnections,
  deleteConnection,
  updateConnection
};