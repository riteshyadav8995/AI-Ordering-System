import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function SiteLayout({ children }) {
  const { pathname, hash } = useLocation();

  // Scroll to the anchor when one is present (e.g. /#faq), otherwise to the top.
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return (
    <div className="min-h-screen bg-cream text-black antialiased">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
