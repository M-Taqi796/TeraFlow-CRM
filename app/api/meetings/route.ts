import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Meetings API ready', data: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: 'Meeting created', data: body });
}
