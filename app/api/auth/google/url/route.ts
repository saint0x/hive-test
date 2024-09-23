import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/google/url`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Google auth URL');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Google auth URL:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}