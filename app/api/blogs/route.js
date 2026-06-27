import { NextResponse } from 'next/server';
import { getBlogs, createBlog } from '@/lib/content';

export async function GET() {
  try {
    const blogs = await getBlogs();
    return NextResponse.json(blogs);
  } catch {
    return NextResponse.json({ error: 'Failed to read blogs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const blog = await createBlog(body);
    return NextResponse.json(blog, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
