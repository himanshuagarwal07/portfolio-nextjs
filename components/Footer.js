export default function Footer({ data }) {
  const { name, location, availability } = data;

  return (
    <footer>
      <span>© 2026 {name}</span>
      <span>{location} · {availability}</span>
      <a href="/admin" className="footer-admin-link">Admin</a>
    </footer>
  );
}
