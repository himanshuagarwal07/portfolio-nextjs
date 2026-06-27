import { NextResponse } from 'next/server';

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL  || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export async function GET(request, { params }) {
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
    const cv = await redis.get('portfolio_cv');

    if (!cv || !cv.data) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    const buffer = Buffer.from(cv.data, 'base64');
    const { filename } = await params;

    return new Response(buffer, {
      headers: {
        'Content-Type': cv.type || 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to serve CV' }, { status: 500 });
  }
}
