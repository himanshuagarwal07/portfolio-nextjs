import { NextResponse } from 'next/server';
import { getContent, saveContent } from '@/lib/content';

export async function GET() {
  try {
    const content = getContent();
    return NextResponse.json(content);
  } catch {
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    saveContent(body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}
