export default function Expertise({ items }) {
  return (
    <section id="expertise">
      <div className="wrap">
        <span className="label">What I do</span>
        <h2 className="section-title">Six hats,&nbsp; one voice</h2>
        <div className="expertise-grid">
          {items.map((item) => (
            <div key={item.id} className="expertise-card">
              <span className="expertise-icon">{item.icon}</span>
              <div className="expertise-title">{item.title}</div>
              <p className="expertise-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
