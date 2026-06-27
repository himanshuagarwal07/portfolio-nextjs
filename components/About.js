export default function About({ data }) {
  const { quote, paragraphs, stats } = data;

  return (
    <section id="about">
      <div className="wrap">
        <span className="label">About me</span>
        <h2 className="section-title">A writer shaped by<br />many worlds</h2>
        <div className="about-grid">
          <blockquote className="about-quote">
            <span className="big-q">&ldquo;</span>
            {quote}
          </blockquote>
          <div className="about-body">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <div className="about-stats">
          {stats.map((s) => (
            <div key={s.id}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
