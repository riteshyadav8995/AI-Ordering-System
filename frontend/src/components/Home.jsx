import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic, MessageCircle, DollarSign, ChevronRight, Phone, Mail, MapPin, Share2, ExternalLink, Globe, Menu, X } from 'lucide-react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_40px_rgba(0,0,0,0.08)] border-b border-gray-100'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo + Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Neon Bite Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-shadow"
            />
            <div>
              <span className="text-xl font-black text-gray-900 tracking-tight">
                Neon Bite
              </span>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 leading-none">AI-Powered Food Delivery</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Testimonials</a>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-full bg-gray-900 text-white font-bold text-sm hover:bg-gray-700 transition-all flex items-center gap-1.5"
            >
              Get Started <ChevronRight size={15} />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-6 flex flex-col gap-4 shadow-lg">
            <a href="#features" className="font-semibold text-gray-700 hover:text-cyan-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="font-semibold text-gray-700 hover:text-cyan-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#testimonials" className="font-semibold text-gray-700 hover:text-cyan-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
            <hr className="border-gray-100" />
            <Link to="/login" className="font-bold text-gray-700" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link
              to="/register"
              className="px-5 py-3 rounded-full bg-gray-900 text-white font-bold text-center hover:bg-gray-700 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-40 pb-24 px-6 lg:px-12 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] rounded-full blur-[140px] opacity-20 bg-gradient-to-r from-blue-300 to-cyan-300 pointer-events-none -z-10"></div>

        <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-700 text-sm font-bold px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-gray-900 rounded-full"></span>
          AI Voice Ordering — Now Live
        </div>

        <img src="/logo.png" alt="Neon Bite Logo" className="w-20 h-20 rounded-2xl object-cover shadow-xl mb-8" />
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-gray-900 leading-[1.05]">
          Never Miss an Order <br/>
          <span className="text-gray-500">Even During Rush Hours.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed font-medium">
          An AI voice and chat ordering assistant that answers calls, texts on WhatsApp, captures orders, and pushes them directly to your POS — 24/7.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/register" className="px-8 py-4 rounded-full bg-gray-900 text-white font-bold text-lg hover:bg-gray-700 transition-all flex items-center gap-2">
            Get Started <ChevronRight size={20} />
          </Link>
          <Link to="/login" className="px-8 py-4 rounded-full border border-gray-200 text-gray-700 font-bold text-lg hover:bg-gray-50 transition-colors">
            Login
          </Link>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="py-24 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Omnichannel Ordering System</h2>
            <p className="text-gray-500 text-lg">One intelligent AI handles all your customer touchpoints.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Mic size={28}/>, color: 'bg-blue-100 text-blue-600', title: 'AI Voice Calls', desc: 'Answers restaurant calls naturally, handles menu FAQs, and captures exact orders over the phone.' },
              { icon: <MessageCircle size={28}/>, color: 'bg-green-100 text-green-600', title: 'WhatsApp Bot', desc: 'Customers can text or send voice notes on WhatsApp to order, pay, and track their delivery instantly.' },
              { icon: <DollarSign size={28}/>, color: 'bg-purple-100 text-purple-600', title: 'POS & Payments', desc: 'Orders are pushed directly to your KOT/POS system. Generates UPI payment links automatically.' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6`}>{f.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center text-gray-900 mb-16">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Customer Calls', desc: 'A customer calls or texts your number during peak hours.' },
              { step: '02', title: 'AI Answers', desc: 'The AI understands natural language, accents, and custom requests.' },
              { step: '03', title: 'Address & Pay', desc: 'Collects delivery details and confirms payment via a secure link.' },
              { step: '04', title: 'Kitchen Prep', desc: 'Order appears instantly on your Admin Dashboard or POS.' },
            ].map((item, idx) => (
              <div key={idx} className="relative p-6 group">
                <div className="text-7xl font-black text-gray-100 group-hover:text-cyan-100 transition-colors absolute top-0 left-0 -z-10 select-none">{item.step}</div>
                <h3 className="text-xl font-bold mt-8 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-12">Trusted by Restaurants</h2>
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <p className="text-2xl italic text-gray-700 font-medium mb-8 leading-relaxed">
              "We used to miss 20% of our orders during the Friday rush. Now, the AI handles all the phone calls and WhatsApp messages simultaneously. Absolutely game-changing."
            </p>
            <div>
              <div className="font-bold text-lg text-gray-900">Rahul Sharma</div>
              <div className="text-gray-500">Owner, The Spice Grill</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50 text-gray-900 text-center border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900">Ready to Automate Your Orders?</h2>
          <p className="text-gray-500 text-xl mb-10 leading-relaxed">Sign up today and get your AI Voice Agent up and running in minutes.</p>
          <Link to="/register" className="inline-block px-10 py-5 rounded-full bg-gray-900 text-white font-bold text-lg hover:bg-gray-700 transition-all">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white text-gray-500 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-10">
          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

            {/* Col 1: Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Neon Bite Logo" className="w-10 h-10 rounded-xl object-cover" />
                <span className="text-lg font-black text-gray-900 tracking-tight">Neon Bite</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                The next generation of restaurant ordering — fully automated, fully conversational, always available.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-900">
                  <Share2 size={15} />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-900">
                  <ExternalLink size={15} />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-900">
                  <Globe size={15} />
                </a>
              </div>
            </div>

            {/* Col 2: Product */}
            <div>
              <h4 className="text-gray-900 font-bold mb-5 text-sm uppercase tracking-widest">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a></li>
                <li><Link to="/register" className="hover:text-gray-900 transition-colors">Get Started</Link></li>
                <li><Link to="/login" className="hover:text-gray-900 transition-colors">Login</Link></li>
              </ul>
            </div>

            {/* Col 3: Use Cases */}
            <div>
              <h4 className="text-gray-900 font-bold mb-5 text-sm uppercase tracking-widest">Use Cases</h4>
              <ul className="space-y-3 text-sm">
                <li>Restaurants & QSR</li>
                <li>Cloud Kitchens</li>
                <li>Hotel Room Service</li>
                <li>Food Chains</li>
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div>
              <h4 className="text-gray-900 font-bold mb-5 text-sm uppercase tracking-widest">Contact</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3">
                  <Mail size={15} className="shrink-0 text-gray-400" />
                  <span>support@neonbite.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={15} className="shrink-0 text-gray-400" />
                  <span>+91 95138 86363</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={15} className="shrink-0 mt-0.5 text-gray-400" />
                  <span>Hyderabad, Telangana, India</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright Bar */}
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2026 Neon Bite Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-gray-700 transition-colors cursor-default">Privacy Policy</span>
              <span className="hover:text-gray-700 transition-colors cursor-default">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

