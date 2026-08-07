import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Utensils, Loader2, Mic, Sparkles, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/order');
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-gray-900 font-sans">

      {/* LEFT: BRAND PANEL */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-start p-16 border-r border-gray-100 bg-gray-50">
        <div className="w-full max-w-lg mx-auto">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="Neon Bite" className="w-12 h-12 rounded-xl object-cover shadow" />
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Neon Bite</h1>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI-Powered Food Delivery</span>
            </div>
          </Link>

          <h2 className="text-5xl font-black leading-tight mb-6 text-gray-900">
            The future of<br/>
            <span className="text-gray-500">voice ordering</span><br/>
            is here.
          </h2>

          <p className="text-gray-500 text-base mb-10 leading-relaxed">
            Experience a frictionless, hands-free dining experience. Neon Bite uses advanced AI to understand natural language and process orders in real-time.
          </p>

          <div className="space-y-5">
            {[
              { icon: <Mic size={18}/>, bg: 'bg-gray-100', title: 'Conversational AI', desc: 'Speak naturally, our AI understands you.' },
              { icon: <Sparkles size={18}/>, bg: 'bg-gray-100', title: 'Real-time Updates', desc: 'Watch your cart update instantly as you speak.' },
              { icon: <ShieldCheck size={18}/>, bg: 'bg-gray-100', title: 'Secure & Fast', desc: 'Seamless and safe payment processing.' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${f.bg} flex items-center justify-center text-gray-600 shrink-0`}>
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{f.title}</h4>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: LOGIN FORM */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 md:hidden">
            <img src="/logo.png" alt="Neon Bite" className="w-9 h-9 rounded-lg object-cover" />
            <span className="font-black text-gray-900">Neon Bite</span>
          </Link>

          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mb-6 shadow">
              <Utensils size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1 font-medium">Log in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-5 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-5 py-4 rounded-xl outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all font-medium placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-5 py-4 rounded-xl outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all font-medium placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gray-900 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-700 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </button>
          </form>

          <p className="text-gray-500 text-center mt-6 text-sm font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-gray-900 font-bold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
