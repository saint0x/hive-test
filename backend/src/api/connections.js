const { google } = require('googleapis');
const sheetsApi = require('./sheets');
const slidesApi = require('./slides');

let connections = [];

async function createConnection(auth, sourceId, targetId, sourceRange, targetRange, isSlideSource, isImage = false) {
  try {
    const connection = {
      id: `connection_${Date.now()}`,
      sourceId,
      targetId,
      sourceRange,
      targetRange,
      isSlideSource,
      isImage,
      order: connections.length
    };

    if (isSlideSource) {
      // Slide to Sheet connection
      await sheetsApi.createOrUpdateCell(auth, targetId, targetRange);
    } else {
      // Sheet to Slide connection
      await slidesApi.createOrUpdateElement(auth, targetId, targetRange, isImage);
    }

    connections.push(connection);
    await syncConnection(auth, connection);
    return connection;
  } catch (error) {
    console.error('Error creating connection:', error);
    throw new Error(`Failed to create connection: ${error.message}`);
  }
}

async function syncConnection(auth, connection) {
  try {
    if (connection.isSlideSource) {
      // Sync from Slide to Sheet
      const slideContent = await slidesApi.getElementContent(auth, connection.sourceId, connection.sourceRange);
      await sheetsApi.updateCell(auth, connection.targetId, connection.targetRange, slideContent);
    } else {
      // Sync from Sheet to Slide
      const sheetValue = await sheetsApi.getCellValue(auth, connection.sourceId, connection.sourceRange);
      if (connection.isImage) {
        await slidesApi.updateSlideImage(auth, connection.targetId, connection.targetRange, sheetValue);
      } else {
        const currentStyle = await slidesApi.getTextStyle(auth, connection.targetId, connection.targetRange);
        await slidesApi.updateSlideText(auth, connection.targetId, connection.targetRange, sheetValue);
        await slidesApi.updateTextStyle(auth, connection.targetId, connection.targetRange, currentStyle);
      }
    }
  } catch (error) {
    console.error('Error syncing connection:', error);
    throw new Error(`Failed to sync connection: ${error.message}`);
  }
}

async function moveConnection(auth, connectionId, direction) {
  const index = connections.findIndex(conn => conn.id === connectionId);
  if (index === -1) {
    throw new Error('Connection not found');
  }

  const connection = connections[index];
  const currentRow = parseInt(connection.sheetRange.match(/\d+/)[0]);
  const newRow = direction === 'up' ? currentRow - 1 : currentRow + 1;

  if (newRow < 1) {
    throw new Error('Cannot move above the first row');
  }

  // Update the sheet range
  const oldRange = connection.sheetRange;
  connection.sheetRange = connection.sheetRange.replace(/\d+/, newRow);

  // Swap order with adjacent connection
  const adjacentIndex = connections.findIndex(conn => 
    conn.sheetId === connection.sheetId && 
    conn.sheetRange.includes(`!${newRow}`)
  );

  if (adjacentIndex !== -1) {
    const temp = connections[index].order;
    connections[index].order = connections[adjacentIndex].order;
    connections[adjacentIndex].order = temp;
  }

  // Re-sort connections based on order
  connections.sort((a, b) => a.order - b.order);

  // Update the content in Google Sheets
  const sheets = google.sheets({ version: 'v4', auth });
  const values = await sheets.spreadsheets.values.get({
    spreadsheetId: connection.sheetId,
    range: oldRange
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: connection.sheetId,
    range: connection.sheetRange,
    valueInputOption: 'RAW',
    resource: { values: values.data.values }
  });

  // Clear the old cell
  await sheets.spreadsheets.values.clear({
    spreadsheetId: connection.sheetId,
    range: oldRange
  });

  // Sync the connection to update the slide
  await syncConnection(auth, connection);

  return connection;
}

async function syncAllConnections(auth) {
  for (const connection of connections) {
    await syncConnection(auth, connection);
  }
}

function getConnections() {
  return connections.sort((a, b) => a.order - b.order);
}

function deleteConnection(connectionId) {
  const index = connections.findIndex(conn => conn.id === connectionId);
  if (index !== -1) {
    connections.splice(index, 1);
    // Update order for remaining connections
    connections.forEach((conn, i) => conn.order = i);
    return true;
  }
  return false;
}

async function updateConnection(auth, connectionId, updates) {
  const connectionIndex = connections.findIndex(conn => conn.id === connectionId);
  if (connectionIndex === -1) {
    throw new Error('Connection not found');
  }

  const connection = connections[connectionIndex];
  const updatedConnection = { ...connection, ...updates };

  if (updates.sheetRange && updates.sheetRange !== connection.sheetRange) {
    // If sheet range has changed, move the content in Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });
    const values = await sheets.spreadsheets.values.get({
      spreadsheetId: connection.sheetId,
      range: connection.sheetRange
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: connection.sheetId,
      range: updates.sheetRange,
      valueInputOption: 'RAW',
      resource: { values: values.data.values }
    });

    // Clear the old range
    await sheets.spreadsheets.values.clear({
      spreadsheetId: connection.sheetId,
      range: connection.sheetRange
    });
  }

  connections[connectionIndex] = updatedConnection;
  await syncConnection(auth, updatedConnection);

  return updatedConnection;
}

async function reorderConnections(auth, connectionIds) {
  try {
    const reorderedConnections = connectionIds.map((id, index) => {
      const connection = connections.find(conn => conn.id === id);
      if (!connection) {
        throw new Error(`Connection with id ${id} not found`);
      }
      connection.order = index;
      return connection;
    });

    connections = [
      ...reorderedConnections,
      ...connections.filter(conn => !connectionIds.includes(conn.id))
    ];

    // Update the order in Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });
    for (const connection of reorderedConnections) {
      const values = await sheets.spreadsheets.values.get({
        spreadsheetId: connection.sheetId,
        range: connection.sheetRange
      });

      const newRow = connection.order + 1; // +1 because Sheets is 1-indexed
      const newRange = connection.sheetRange.replace(/\d+/, newRow);

      await sheets.spreadsheets.values.update({
        spreadsheetId: connection.sheetId,
        range: newRange,
        valueInputOption: 'RAW',
        resource: { values: values.data.values }
      });

      // Update the connection's sheet range
      connection.sheetRange = newRange;
    }

    // Sync all reordered connections
    for (const connection of reorderedConnections) {
      await syncConnection(auth, connection);
    }

    return reorderedConnections;
  } catch (error) {
    console.error('Error reordering connections:', error);
    throw new Error(`Failed to reorder connections: ${error.message}`);
  }
}

module.exports = {
  createConnection,
  syncConnection,
  syncAllConnections,
  getConnections,
  deleteConnection,
  updateConnection,
  reorderConnections,
  moveConnection
};