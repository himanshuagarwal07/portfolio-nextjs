import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(originalName).toLowerCase();

    if (!['.pdf', '.doc', '.docx'].includes(ext)) {
      return NextResponse.json({ error: 'Only PDF, DOC, DOCX files allowed' }, { status: 400 });
    }

    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 });
    }

    if (USE_BLOB) {
      // Vercel Blob (production)
      const { put } = await import('@vercel/blob');
      const blob = await put(`cv/${originalName}`, buffer, {
        access: 'public',
        contentType: file.type || 'application/pdf',
      });
      return NextResponse.json({ url: blob.url });
    } else {
      // Local dev: save to /public
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
      const destPath = path.join(publicDir, originalName);
      fs.writeFileSync(destPath, buffer);
      return NextResponse.json({ url: `/${originalName}` });
    }
  } catch (err) {
    console.error('CV upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
