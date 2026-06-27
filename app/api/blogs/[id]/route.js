import { NextResponse } from 'next/server';
import { updateBlog, deleteBlog } from '@/lib/content';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateBlog(id, body);
    if (!updated) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const ok = await deleteBlog(id);
    if (!ok) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
