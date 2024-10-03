import { NextRequest, NextResponse } from 'next/server';
import { oauth2Client, getSpreadsheets, getPresentations } from '@/utils/googleAuth';

export async function GET(request: NextRequest) {
  const googleTokens = request.cookies.get('google_tokens')?.value;
  
  if (!googleTokens) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const tokens = JSON.parse(googleTokens);
    oauth2Client.setCredentials(tokens);

    const [spreadsheets, presentations] = await Promise.all([
      getSpreadsheets(oauth2Client),
      getPresentations(oauth2Client)
    ]);

    return NextResponse.json({ spreadsheets, presentations });
  } catch (error: unknown) {
    console.error('Error fetching Google files:', error);
    if (error instanceof Error) {
      if ('response' in error && typeof error.response === 'object' && error.response && 'status' in error.response) {
        if (error.response.status === 401) {
          return NextResponse.json({ error: 'Authentication expired' }, { status: 401 });
        }
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}