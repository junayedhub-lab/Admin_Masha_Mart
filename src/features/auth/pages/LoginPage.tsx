import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAdminAuthStore } from '../../../store/authStore';
import { adminConfig } from '../../../config/adminConfig';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signIn, loading } = useAdminAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'linear-gradient(135deg, #E91E63, #FF6F00)' }} />
        <div className="absolute -bottom-60 -left-60 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'linear-gradient(135deg, #E91E63, #FF6F00)' }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-5"
          style={{ background: '#E91E63' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold"
            style={{ background: 'linear-gradient(135deg, #E91E63, #FF6F00)' }}
          >
            M
          </div>
          <h1 className="text-2xl font-bold text-white">{adminConfig.brand.admin_title}</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.06] backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center fade-in">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mashamart.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-pink-500/25"
              style={{ background: 'linear-gradient(135deg, #E91E63, #C2185B)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          © {new Date().getFullYear()} {adminConfig.brand.app_name}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
