const { v4: uuidv4 } = require('uuid');
const { runQuery, getQuery, allQuery } = require('../db/database');
const sheetsApi = require('./sheets');
const slidesApi = require('./slides');

async function createConnection(auth, sheetId, slideId, sheetRange, slidePageId, x, y, width, height) {
  try {
    const elementId = await slidesApi.createPlaceholder(auth, slideId, slidePageId, 'TEXT_BOX', x, y, width, height);
    const connection = {
      id: uuidv4(),
      sheetId,
      slideId,
      sheetRange,
      slidePageId,
      slideElementId: elementId,
      x,
      y,
      width,
      height
    };

    await runQuery(
      'INSERT INTO connections (id, sheetId, slideId, sheetRange, slidePageId, slideElementId, x, y, width, height) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [connection.id, connection.sheetId, connection.slideId, connection.sheetRange, connection.slidePageId, connection.slideElementId, connection.x, connection.y, connection.width, connection.height]
    );

    await syncConnection(auth, connection);
    return connection;
  } catch (error) {
    console.error('Error creating connection:', error);
    throw new Error(`Failed to create connection: ${error.message}`);
  }
}

async function getConnections(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const connections = await allQuery('SELECT * FROM connections LIMIT ? OFFSET ?', [pageSize, offset]);
  const totalCount = await getQuery('SELECT COUNT(*) as count FROM connections');
  return {
    connections,
    totalPages: Math.ceil(totalCount.count / pageSize),
    currentPage: page
  };
}

async function updateConnection(auth, connectionId, updates) {
  const connection = await getQuery('SELECT * FROM connections WHERE id = ?', [connectionId]);
  if (!connection) {
    throw new Error('Connection not found');
  }

  const updatedConnection = { ...connection, ...updates };
  await runQuery(
    'UPDATE connections SET sheetId = ?, slideId = ?, sheetRange = ?, slidePageId = ?, slideElementId = ?, x = ?, y = ?, width = ?, height = ? WHERE id = ?',
    [updatedConnection.sheetId, updatedConnection.slideId, updatedConnection.sheetRange, updatedConnection.slidePageId, updatedConnection.slideElementId, updatedConnection.x, updatedConnection.y, updatedConnection.width, updatedConnection.height, connectionId]
  );

  await syncConnection(auth, updatedConnection);
  return updatedConnection;
}

async function deleteConnection(connectionId) {
  await runQuery('DELETE FROM connections WHERE id = ?', [connectionId]);
}

async function reorderConnections(connectionIds) {
  // This function would need to be implemented if you want to maintain a specific order for connections
  // For now, we'll just return the connectionIds as is
  return connectionIds;
}

async function syncConnection(auth, connection) {
  try {
    const sheetValues = await sheetsApi.getSpreadsheetValues(auth, connection.sheetId, connection.sheetRange);
    const content = sheetValues.map(row => row.join(' ')).join('\n');
    await slidesApi.updateSlideText(auth, connection.slideId, connection.slidePageId, connection.slideElementId, content);
  } catch (error) {
    console.error('Error syncing connection:', error);
    throw new Error(`Failed to sync connection: ${error.message}`);
  }
}

async function syncAllConnections(auth) {
  const connections = await getConnections();
  for (const connection of connections) {
    await syncConnection(auth, connection);
  }
}

async function generateBatchSlides(auth, slideId, sheetId, sheetRange, count) {
  try {
    const sheetValues = await sheetsApi.getSpreadsheetValues(auth, sheetId, sheetRange);
    const newConnections = [];

    for (let i = 0; i < Math.min(count, sheetValues.length); i++) {
      const rowData = sheetValues[i];
      const newSlideId = await slidesApi.createSlide(auth, slideId);
      
      for (let j = 0; j < rowData.length; j++) {
        const elementId = await slidesApi.createPlaceholder(
          auth, 
          slideId, 
          newSlideId, 
          'TEXT_BOX', 
          50 + (j * 200), 50, 150, 50
        );
        
        await slidesApi.updateSlideText(auth, slideId, newSlideId, elementId, rowData[j]);
        
        const connection = {
          id: uuidv4(),
          sheetId,
          slideId,
          sheetRange: `${sheetRange.split('!')[0]}!${String.fromCharCode(65 + j)}${i + 1}`,
          slidePageId: newSlideId,
          slideElementId: elementId,
          x: 50 + (j * 200),
          y: 50,
          width: 150,
          height: 50
        };
        
        await runQuery(
          'INSERT INTO connections (id, sheetId, slideId, sheetRange, slidePageId, slideElementId, x, y, width, height) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [connection.id, connection.sheetId, connection.slideId, connection.sheetRange, connection.slidePageId, connection.slideElementId, connection.x, connection.y, connection.width, connection.height]
        );
        
        newConnections.push(connection);
      }
    }

    return newConnections;
  } catch (error) {
    console.error('Error generating batch slides:', error);
    throw new Error(`Failed to generate batch slides: ${error.message}`);
  }
}

async function moveConnections(auth, connectionIds, direction) {
  const connections = await getConnections();
  const sortedConnections = connectionIds.map(id => connections.find(conn => conn.id === id)).filter(Boolean);

  for (const connection of sortedConnections) {
    const [sheetName, cellRange] = connection.sheetRange.split('!');
    const [startCell, endCell] = cellRange.split(':');
    const startRow = parseInt(startCell.match(/\d+/)[0]);
    const endRow = endCell ? parseInt(endCell.match(/\d+/)[0]) : startRow;

    const newStartRow = direction === 'up' ? startRow - 1 : startRow + 1;
    const newEndRow = direction === 'up' ? endRow - 1 : endRow + 1;

    const newSheetRange = `${sheetName}!${startCell.replace(/\d+/, newStartRow)}:${endCell.replace(/\d+/, newEndRow)}`;

    await updateConnection(auth, connection.id, { sheetRange: newSheetRange });
  }

  return getConnections();
}

module.exports = {
  createConnection,
  getConnections,
  updateConnection,
  deleteConnection,
  reorderConnections,
  syncConnection,
  syncAllConnections,
  generateBatchSlides,
  moveConnections,
};