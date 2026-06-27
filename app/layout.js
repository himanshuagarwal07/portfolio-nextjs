import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { getContent } from '@/lib/content';
import './globals.css';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Supradarsana Chanda — Writer & Content Strategist',
  description:
    'Technical writer, SaaS storyteller, lifestyle essayist, and jewellery blogger based in Jaipur, India.',
};

export default async function RootLayout({ children }) {
  let colors = {};
  try {
    const content = await getContent();
    colors = content.colors || {};
  } catch {
    // fallback to CSS defaults
  }

  const cssVars = [
    colors.heroFirst   && `--c-hero-first:${colors.heroFirst}`,
    colors.heroLast    && `--c-hero-last:${colors.heroLast}`,
    colors.primary     && `--c-primary:${colors.primary}`,
    colors.accent      && `--c-accent:${colors.accent}`,
    colors.background  && `--c-bg:${colors.background}`,
  ].filter(Boolean).join(';');

  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      {cssVars && (
        <head>
          <style>{`:root{${cssVars}}`}</style>
        </head>
      )}
      <body style={colors.background ? { background: colors.background } : {}}>
        {children}
      </body>
    </html>
  );
}
