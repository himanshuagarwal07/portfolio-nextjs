export default function Process({ steps, tools }) {
  return (
    <section id="process">
      <div className="wrap">
        <span className="label">How I work</span>
        <h2 className="section-title">From brief to brilliant</h2>

        <div className="process-track">
          <div className="process-connector" />
          <div className="process-list">
            {steps.map((step) => (
              <div key={step.id} className="process-step">
                <div className="process-dot" />
                <div className="process-num">{step.num}</div>
                <div className="process-name">{step.name}</div>
                <p className="process-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="tools-section">
          <span className="label">Tools I use</span>
          <div className="tools-grid">
            {tools.map((t) => (
              <span key={t} className="tool-tag">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
