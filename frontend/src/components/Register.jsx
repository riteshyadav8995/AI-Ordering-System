import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Utensils, Loader2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(formData);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0A0A0A]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-20 bg-gradient-to-r from-purple-900 to-pink-900"></div>
      </div>
      
      <div className="z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center mb-4">
            <Utensils size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="text-gray-400 mt-2">Join to use AI voice ordering</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-center text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <input 
              type="text" 
              name="firstName"
              placeholder="First Name" 
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-1/2 bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-purple-500 transition-colors"
            />
            <input 
              type="text" 
              name="lastName"
              placeholder="Last Name" 
              value={formData.lastName}
              onChange={handleChange}
              className="w-1/2 bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <input 
            type="tel" 
            name="mobile"
            placeholder="Mobile Number" 
            required
            value={formData.mobile}
            onChange={handleChange}
            className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-purple-500 transition-colors"
          />
          <input 
            type="email" 
            name="email"
            placeholder="Email Address" 
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-purple-500 transition-colors"
          />
          <input 
            type="password" 
            name="password"
            placeholder="Password" 
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-purple-500 transition-colors"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-shadow"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Register"}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-purple-400 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
