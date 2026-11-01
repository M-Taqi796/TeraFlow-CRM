import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Tasks API ready', data: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: 'Task created', data: body });
}
