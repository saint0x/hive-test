import { spawn } from 'child_process';
import fetch from 'node-fetch';

// Hardcoded environment variables
const GOOGLE_CLIENT_ID = '1027395944679-gpv1ct5ncvmucji8hh0i8hkgbg91ti6s.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';

// Sample document IDs
const SAMPLE_SHEET_ID = '1WmFcDA6zooFIqpA0OsOClijOQwqYDbaobdI8T6TwyvE';
const SAMPLE_SLIDE_ID = '1YMaDa_pSlF_8qvoTAtUhLLog_edsEqgDKzDWW_OaY20';

// Start the server
function startServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['src/index.js']);
    
    server.stdout.on('data', (data) => {
      console.log(`🖥️  Server: ${data}`);
      if (data.includes('Backend server is running')) {
        console.log('✅ Server started successfully');
        resolve(server);
      }
    });

    server.stderr.on('data', (data) => {
      console.error(`🚨 Server Error: ${data}`);
    });

    server.on('close', (code) => {
      console.log(`🛑 Server process exited with code ${code}`);
    });

    // Timeout if server doesn't start within 10 seconds
    setTimeout(() => {
      reject(new Error('Server startup timed out'));
    }, 10000);
  });
}

// Test connecting Sheets and Slides
async function testConnection() {
  console.log('🔗 Testing connection between Sheets and Slides');

  try {
    const response = await fetch('http://localhost:3001/api/connections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheetId: SAMPLE_SHEET_ID,
        slideId: SAMPLE_SLIDE_ID,
        sheetRange: 'Sheet1!A1:B2',
        slidePageId: 'p',
        x: 100,
        y: 100,
        width: 300,
        height: 50,
        isImage: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection created successfully:', data);
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to create connection: Status ${response.status}`, errorText);
    }
  } catch (error) {
    console.error('❌ Error testing connection:', error);
  }
}

// Test fetching spreadsheet data
async function testFetchSpreadsheetData() {
  console.log('📊 Testing fetching spreadsheet data');

  try {
    const response = await fetch(`http://localhost:3001/api/sheets/spreadsheets/${SAMPLE_SHEET_ID}/values?range=Sheet1!A1:B2`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Spreadsheet data fetched successfully:', data);
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to fetch spreadsheet data: Status ${response.status}`, errorText);
    }
  } catch (error) {
    console.error('❌ Error fetching spreadsheet data:', error);
  }
}

// Test updating slide content
async function testUpdateSlideContent() {
  console.log('🖼️ Testing updating slide content');

  try {
    const response = await fetch(`http://localhost:3001/api/slides/presentations/${SAMPLE_SLIDE_ID}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        updates: [
          {
            elementId: 'placeholder_1',
            content: 'Updated content from script'
          }
        ]
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Slide content updated successfully:', data);
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to update slide content: Status ${response.status}`, errorText);
    }
  } catch (error) {
    console.error('❌ Error updating slide content:', error);
  }
}

// Main test function
async function runTests() {
  let server;
  try {
    console.log('🚀 Starting server...');
    server = await startServer();

    console.log('🏥 Checking server health...');
    const healthResponse = await fetch('http://localhost:3001/health');
    if (healthResponse.ok) {
      console.log('💚 Server is healthy');
    } else {
      throw new Error('Server health check failed');
    }

    await testConnection();
    await testFetchSpreadsheetData();
    await testUpdateSlideContent();

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (server) {
      console.log('🛑 Shutting down server...');
      server.kill();
    }
  }
}

runTests();