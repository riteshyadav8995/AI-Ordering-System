import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="max-w-6xl mx-auto px-5 py-12 grid gap-10 sm:grid-cols-2 md:grid-cols-4 text-sm">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 mb-3">
            <img src="/logo.png" alt="" className="w-7 h-7 rounded-md object-cover" />
            <span className="font-display text-lg font-semibold text-ink">Neon Bite</span>
          </Link>
          <p className="text-black max-w-xs leading-relaxed">
            Pizza, burgers and more from our kitchen in Hyderabad. Order by voice or chat.
          </p>
        </div>
        <div>
          <h4 className="font-medium text-ink mb-3">Pages</h4>
          <ul className="space-y-2 text-black">
            <li><Link to="/menu" className="hover:text-ink">Menu</Link></li>
            <li><Link to="/#how-it-works" className="hover:text-ink">How it works</Link></li>
            <li><Link to="/about" className="hover:text-ink">About</Link></li>
            <li><Link to="/#faq" className="hover:text-ink">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-ink mb-3">Get in touch</h4>
          <ul className="space-y-2 text-black">
            <li>support@neonbite.com</li>
            <li>+91 95138 86363</li>
            <li>Hyderabad, Telangana</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 py-6 border-t border-line text-xs text-black">
        © 2026 Neon Bite
      </div>
    </footer>
  );
}
