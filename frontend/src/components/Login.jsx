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
        navigate('/');
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0A0A0A] text-white font-sans">
      
      {/* LEFT SECTION: ABOUT THE COMPANY */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-center items-start p-16 overflow-hidden border-r border-white/5">
        {/* Dynamic Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-20 bg-gradient-to-r from-cyan-600 to-blue-900"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] rounded-full blur-[100px] opacity-10 bg-gradient-to-l from-purple-800 to-black"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <img src="/logo.png" alt="AuraVoice Logo" className="w-14 h-14 rounded-2xl object-cover shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight">
                AuraVoice
              </h1>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next-Gen Ordering</span>
            </div>
          </div>
          
          <h2 className="text-5xl font-black leading-[1.1] mb-6">
            The future of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">voice ordering</span> <br/>
            is here.
          </h2>
          
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Experience a frictionless, hands-free dining experience. AuraVoice uses advanced AI to instantly understand your natural language, customize your meals, and process your orders in real-time.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Mic size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-200">Conversational AI</h4>
                <p className="text-sm text-gray-500">Speak naturally, our AI understands you.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-200">Real-time Updates</h4>
                <p className="text-sm text-gray-500">Watch your cart update instantly as you speak.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-200">Secure & Fast</h4>
                <p className="text-sm text-gray-500">Seamless and safe payment processing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: LOGIN FORM */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 relative bg-black/40">
        <div className="absolute inset-0 overflow-hidden pointer-events-none md:hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-20 bg-gradient-to-r from-blue-900 to-purple-900"></div>
        </div>
        
        <div className="z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-[0_10px_20px_rgba(6,182,212,0.3)] transform -rotate-3">
              <Utensils size={32} className="text-white transform rotate-3" />
            </div>
            <h2 className="text-3xl font-black text-white">Welcome Back</h2>
            <p className="text-gray-400 mt-2 font-medium">Log in to place your order</p>
          </div>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-center text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 text-white px-5 py-4 rounded-xl outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 text-white px-5 py-4 rounded-xl outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-shadow"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-8 text-sm font-medium">
          Don't have an account? <Link to="/register" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">Create one</Link>
        </p>
        </div>
      </div>
    </div>
  );
}
