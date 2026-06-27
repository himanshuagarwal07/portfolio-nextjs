import { getContent } from '@/lib/content';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Expertise from '@/components/Expertise';
import WritingSection from '@/components/WritingSection';
import Process from '@/components/Process';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default async function Home() {
  const content = await getContent();

  return (
    <>
      <Navbar brandName={`${content.hero.firstName} ${content.hero.lastName}`} />

      <Hero data={content.hero} />
      <hr className="divider" />

      <About data={content.about} />
      <hr className="divider" />

      <Expertise items={content.expertise} />
      <hr className="divider" />

      <WritingSection blogs={content.blogs || []} />
      <hr className="divider" />

      <Process steps={content.process} tools={content.tools} />

      <Contact data={content.contact} />

      <Footer data={content.footer} />
    </>
  );
}
