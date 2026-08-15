import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearAuthError } from '../store/slices/authSlice';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import mentrixLogo from '../assets/mentrix_logo.png';

export const LoginPage: React.FC = () => {
  const location = useLocation();
  const initialEmail = (location.state as { email?: string })?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthError());
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.92, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)' }
      );
      gsap.fromTo(
        '.login-anim',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } else if (loginUser.rejected.match(result)) {
      toast.error((result.payload as string) || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-mentrix-bg flex items-center justify-center p-4 font-inter relative overflow-hidden">
      {/* Ambient Background Lights */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div
        ref={cardRef}
        className="w-full max-w-md glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl relative z-10"
      >
        {/* Header with single brand Logo */}
        <div className="text-center mb-8">
          <img
            src={mentrixLogo}
            alt="Mentrix Logo"
            className="w-16 h-16 object-contain mx-auto mb-3 drop-shadow-xl login-anim"
          />
          <h1 className="text-2xl font-extrabold font-outfit text-white tracking-wide login-anim">
            Mentrix
          </h1>
          <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider login-anim mt-0.5">
            AI Powered Student Assistant
          </p>
          <p className="text-slate-400 text-xs mt-2 login-anim">Sign in to your learning studio</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes('verif') && (
              <Link
                to="/verify-otp"
                state={{ email }}
                className="text-indigo-600 dark:text-indigo-300 font-bold hover:underline ml-2 flex-shrink-0"
              >
                Verify OTP →
              </Link>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="login-anim">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full glass-input pl-11 pr-4 py-3 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="login-anim">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input pl-11 pr-11 py-3 rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-anim w-full glow-btn py-3.5 px-4 rounded-xl text-white font-semibold font-outfit text-base flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 login-anim">
          Don't have an account?{' '}
          <Link to="/register" className="text-mentrix-accent font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
