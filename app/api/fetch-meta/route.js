import { NextResponse } from 'next/server';

function extractMeta(html) {
  function getMeta(...names) {
    for (const name of names) {
      // property="og:..." content="..."
      let m = html.match(
        new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i')
      );
      if (m) return decodeHtml(m[1]);
      // content="..." property="og:..."  (reversed order)
      m = html.match(
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`, 'i')
      );
      if (m) return decodeHtml(m[1]);
    }
    return '';
  }

  function decodeHtml(str) {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#8211;/g, '–')
      .replace(/&#8212;/g, '—');
  }

  const titleTagMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titleFromTag = titleTagMatch ? decodeHtml(titleTagMatch[1].trim()) : '';

  const title = getMeta('og:title', 'twitter:title') || titleFromTag;
  const description = getMeta('og:description', 'twitter:description', 'description');
  const image = getMeta('og:image', 'twitter:image');
  const siteName = getMeta('og:site_name');

  return { title, description, image, siteName };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'url param required' }, { status: 400 });
  }

  try {
    new URL(url); // validate
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; PortfolioMetaBot/1.0; +https://github.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Remote returned HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const meta = extractMeta(html);
    return NextResponse.json(meta);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch URL' },
      { status: 500 }
    );
  }
}
