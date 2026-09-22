import { useState, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import useOrderLink from '../../hooks/useOrderLink';

const links = [
  { to: '/menu', label: 'Menu' },
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const order = useOrderLink();

  const linkClass = ({ isActive }) =>
    `text-sm transition-colors ${isActive ? 'text-ink font-medium' : 'text-black hover:text-ink'}`;

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="w-8 h-8 rounded-md object-cover" />
          <span className="font-display text-xl font-semibold text-ink">Neon Bite</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) =>
            l.to.includes('#') ? (
              <Link key={l.to} to={l.to} className="text-sm text-black hover:text-ink transition-colors">{l.label}</Link>
            ) : (
              <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center gap-5">
          {!user && <Link to="/login" className="text-sm text-black hover:text-ink">Log in</Link>}
          <Link to={order.to} className="px-4 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors">
            {order.label}
          </Link>
        </div>

        <button className="md:hidden p-2 -mr-2 text-ink" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-line px-5 py-5 flex flex-col gap-4" onClick={(e) => e.target.closest('a') && setOpen(false)}>
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-[15px] text-black">{l.label}</Link>
          ))}
          {!user && <Link to="/login" className="text-[15px] text-black">Log in</Link>}
          <Link to={order.to} className="mt-1 text-center px-4 py-3 rounded-md bg-accent text-white text-sm font-medium">
            {order.label}
          </Link>
        </div>
      )}
    </header>
  );
}
