import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
      <nav className="grid grid-flow-col gap-4">
        <Link to="/" className="link link-hover">Accueil</Link>
        <Link to="/catalog" className="link link-hover">Catalogue</Link>
        <Link to="/login" className="link link-hover">Connexion</Link>
      </nav>
      <aside>
        <p className="font-bold text-lg">SiteVideo</p>
        <p className="text-sm opacity-60">Plateforme de gestion multimédia &copy; {new Date().getFullYear()}</p>
      </aside>
    </footer>
  );
}
