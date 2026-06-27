import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'content.json');
const KV_KEY = 'portfolio_content';

// Works with both Upstash direct vars and Vercel KV vars
const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const USE_KV = Boolean(REDIS_URL && REDIS_TOKEN);

async function redisClient() {
  const { Redis } = await import('@upstash/redis');
  return new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
}

export async function getContent() {
  if (USE_KV) {
    const redis = await redisClient();
    const stored = await redis.get(KV_KEY);
    if (stored) return stored;
    // First run: seed Redis from the static JSON file
    const seed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    await redis.set(KV_KEY, seed);
    return seed;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function saveContent(data) {
  if (USE_KV) {
    const redis = await redisClient();
    await redis.set(KV_KEY, data);
    return;
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getBlogs() {
  const content = await getContent();
  return content.blogs || [];
}

export async function createBlog(data) {
  const content = await getContent();
  const blogs = content.blogs || [];
  const maxId = blogs.reduce((m, b) => Math.max(m, b.id), 0);
  const newBlog = { id: maxId + 1, ...data };
  content.blogs = [...blogs, newBlog];
  await saveContent(content);
  return newBlog;
}

export async function updateBlog(id, data) {
  const content = await getContent();
  const blogs = content.blogs || [];
  const idx = blogs.findIndex((b) => b.id === Number(id));
  if (idx === -1) return null;
  blogs[idx] = { ...blogs[idx], ...data, id: Number(id) };
  content.blogs = blogs;
  await saveContent(content);
  return blogs[idx];
}

export async function deleteBlog(id) {
  const content = await getContent();
  const blogs = content.blogs || [];
  const idx = blogs.findIndex((b) => b.id === Number(id));
  if (idx === -1) return false;
  content.blogs = blogs.filter((b) => b.id !== Number(id));
  await saveContent(content);
  return true;
}
