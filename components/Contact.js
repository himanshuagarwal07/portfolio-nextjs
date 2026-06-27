export default function Contact({ data }) {
  const { label, title, subtitle, email, linkedin, cvUrl } = data;

  return (
    <section id="contact" style={{ padding: 0 }}>
      <div className="contact-wrapper">
        <div className="contact-inner">
          <span className="contact-label">{label}</span>
          <h2 className="contact-title">{title}</h2>
          <p className="contact-sub">{subtitle}</p>
          <div className="contact-links">
            <a href={`mailto:${email}`} className="contact-link">Email me</a>
            <a href={linkedin} className="contact-link" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href={cvUrl} className="contact-link" download>Download CV</a>
          </div>
        </div>
      </div>
    </section>
  );
}
