import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'content.json');

export function getContent() {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export function saveContent(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function getBlogs() {
  const content = getContent();
  return content.blogs || [];
}

export function getBlogById(id) {
  const blogs = getBlogs();
  return blogs.find((b) => b.id === Number(id)) || null;
}

export function createBlog(data) {
  const content = getContent();
  const blogs = content.blogs || [];
  const maxId = blogs.reduce((m, b) => Math.max(m, b.id), 0);
  const newBlog = { id: maxId + 1, ...data };
  content.blogs = [...blogs, newBlog];
  saveContent(content);
  return newBlog;
}

export function updateBlog(id, data) {
  const content = getContent();
  const blogs = content.blogs || [];
  const idx = blogs.findIndex((b) => b.id === Number(id));
  if (idx === -1) return null;
  blogs[idx] = { ...blogs[idx], ...data, id: Number(id) };
  content.blogs = blogs;
  saveContent(content);
  return blogs[idx];
}

export function deleteBlog(id) {
  const content = getContent();
  const blogs = content.blogs || [];
  const idx = blogs.findIndex((b) => b.id === Number(id));
  if (idx === -1) return false;
  content.blogs = blogs.filter((b) => b.id !== Number(id));
  saveContent(content);
  return true;
}
