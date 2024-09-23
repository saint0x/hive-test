import fetch from 'node-fetch';
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

const BACKEND_URL = 'http://localhost:3001';
const SLIDES_URL = 'https://docs.google.com/presentation/d/1YMaDa_pSlF_8qvoTAtUhLLog_edsEqgDKzDWW_OaY20';
const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1WmFcDA6zooFIqpA0OsOClijOQwqYDbaobdI8T6TwyvE';

let serverProcess;

async function startServer() {
  console.log('🚀 Starting server...');
  return new Promise((resolve, reject) => {
    serverProcess = spawn('node', ['src/index.js'], { cwd: 'frontend/backend' });

    serverProcess.stdout.on('data', (data) => {
      console.log(`🖥️  Server: ${data}`);
      if (data.includes('Backend server is running')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`🚨 Server Error: ${data}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`🛑 Server process exited with code ${code}`);
    });

    setTimeout(10000).then(() => {
      reject(new Error('Server startup timeout'));
    });
  });
}

async function stopServer() {
  console.log('🛑 Shutting down server...');
  if (serverProcess) {
    serverProcess.kill();
    await new Promise(resolve => serverProcess.on('close', resolve));
  }
}

async function checkServerHealth() {
  console.log('🏥 Checking server health...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (response.ok) {
      console.log('💚 Server is healthy');
    } else {
      console.error('❌ Server health check failed');
    }
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
  }
}

async function testConnection() {
  console.log('🔗 Testing connection between Sheets and Slides');
  try {
    const response = await fetch(`${BACKEND_URL}/api/connections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slidesUrl: SLIDES_URL, sheetsUrl: SHEETS_URL }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection created successfully:', data);
    } else {
      const errorData = await response.json();
      console.error(`❌ Failed to create connection: Status ${response.status}`, errorData);
    }
  } catch (error) {
    console.error('❌ Error creating connection:', error.message);
  }
}

async function testFetchSpreadsheetData() {
  console.log('📊 Testing fetching spreadsheet data');
  try {
    const response = await fetch(`${BACKEND_URL}/api/sheets/spreadsheets/${encodeURIComponent(SHEETS_URL)}/values`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Spreadsheet data fetched successfully:', data);
    } else {
      const errorData = await response.json();
      console.error(`❌ Failed to fetch spreadsheet data: Status ${response.status}`, errorData);
    }
  } catch (error) {
    console.error('❌ Error fetching spreadsheet data:', error.message);
  }
}

async function testUpdateSlideContent() {
  console.log('🖼️ Testing updating slide content');
  try {
    const response = await fetch(`${BACKEND_URL}/api/slides/presentations/${encodeURIComponent(SLIDES_URL)}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Updated content from test script' }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Slide content updated successfully:', data);
    } else {
      const errorData = await response.json();
      console.error(`❌ Failed to update slide content: Status ${response.status}`, errorData);
    }
  } catch (error) {
    console.error('❌ Error updating slide content:', error.message);
  }
}

async function runTests() {
  try {
    await startServer();
    await setTimeout(2000); // Give the server a moment to fully initialize
    await checkServerHealth();
    await testConnection();
    await testFetchSpreadsheetData();
    await testUpdateSlideContent();
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    await stopServer();
  }
}

runTests().then(() => console.log('🏁 Test suite completed'));