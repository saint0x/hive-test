import { NextRequest, NextResponse } from 'next/server';
import { oauth2Client, getSpreadsheets, getPresentations } from '@/utils/googleAuth';

export async function GET(request: NextRequest) {
  const tokens = JSON.parse(request.cookies.get('google_tokens')?.value || '{}');
  
  if (!tokens.access_token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  oauth2Client.setCredentials(tokens);

  try {
    const spreadsheets = await getSpreadsheets(oauth2Client);
    const presentations = await getPresentations(oauth2Client);

    return NextResponse.json({ spreadsheets, presentations });
  } catch (error) {
    console.error('Error fetching Google files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}