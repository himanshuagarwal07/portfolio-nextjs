export default function Hero({ data }) {
  const { eyebrow, firstName, lastName, tagline, description, roles, ctaPrimary, ctaSecondary } = data;

  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-line" />
          <span className="hero-eyebrow-text">{eyebrow}</span>
        </div>
        <h1 className="hero-name">
          {firstName}
          <br />
          <em>{lastName}</em>
        </h1>
        <p className="hero-tagline">{tagline}</p>
        <p className="hero-desc">{description}</p>
        <div className="hero-roles">
          {roles.map((r) => (
            <span key={r} className="role-pill">{r}</span>
          ))}
        </div>
        <div className="hero-cta">
          <a href="#work" className="btn-primary">{ctaPrimary}</a>
          <a href="#contact" className="btn-ghost">
            {ctaSecondary} <span className="arrow">→</span>
          </a>
        </div>
      </div>
      <div className="hero-bg-word" aria-hidden="true">Writer</div>
    </section>
  );
}
