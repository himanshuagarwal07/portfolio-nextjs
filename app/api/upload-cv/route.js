import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL  || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const USE_REDIS   = Boolean(REDIS_URL && REDIS_TOKEN);

async function getRedis() {
  const { Redis } = await import('@upstash/redis');
  return new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const originalName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const ext = path.extname(originalName).toLowerCase();

    if (!['.pdf', '.doc', '.docx'].includes(ext)) {
      return NextResponse.json({ error: 'Only PDF, DOC, DOCX files allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 });
    }

    if (USE_REDIS) {
      // Store in Upstash Redis as base64
      const redis = await getRedis();
      await redis.set('portfolio_cv', {
        name: originalName,
        type: file.type || 'application/pdf',
        data: buffer.toString('base64'),
      });
      return NextResponse.json({ url: `/api/cv/${originalName}` });
    } else {
      // Local dev: save to /public
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
      fs.writeFileSync(path.join(publicDir, originalName), buffer);
      return NextResponse.json({ url: `/${originalName}` });
    }
  } catch (err) {
    console.error('CV upload error:', err);
    return NextResponse.json({ error: 'Upload failed: ' + err.message }, { status: 500 });
  }
}
