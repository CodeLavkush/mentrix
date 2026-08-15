import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import gsap from 'gsap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearAuthError } from '../store/slices/authSlice';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import mentrixLogo from '../assets/mentrix_logo.png';
import showToast from '../utils/toast';

export const LoginPage: React.FC = () => {
  const location = useLocation();
  const initialEmail = (location.state as { email?: string })?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const cardRef = useRef<HTMLDivElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

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

  // Validation rules
  const errors = useMemo(() => {
    const errs: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    return errs;
  }, [email, password]);

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

    if (Object.keys(errors).length > 0) {
      if (errors.email) emailInputRef.current?.focus();
      else if (errors.password) passwordInputRef.current?.focus();

      showToast.warning(errors.email || errors.password || 'Please fill in all required fields.');
      return;
    }

    const toastId = showToast.loading('Signing in to Mentrix...');
    const result = await dispatch(loginUser({ email: email.trim().toLowerCase(), password }));

    if (loginUser.fulfilled.match(result)) {
      showToast.dismiss(toastId);
      showToast.success('Welcome back! Signed in successfully.');
      navigate('/dashboard');
    } else if (loginUser.rejected.match(result)) {
      showToast.dismiss(toastId);
      const errorMsg = (result.payload as string) || 'Login failed. Please check your credentials.';
      showToast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-mentrix-bg flex items-center justify-center p-4 font-inter relative overflow-hidden">
      {/* Ambient Background Lights */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div
        ref={cardRef}
        className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 space-y-6"
      >
        {/* Header with single brand Logo */}
        <div className="text-center">
          <img
            src={mentrixLogo}
            alt="Mentrix Logo"
            className="w-16 h-16 object-contain mx-auto mb-3 drop-shadow-xl login-anim"
          />
          <h1 className="text-2xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-wide login-anim">
            Mentrix
          </h1>
          <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider login-anim mt-0.5">
            AI Powered Student Assistant
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 login-anim">
            Sign in to access your intelligent learning studio
          </p>
        </div>

        {/* Server Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes('verif') && (
              <Link
                to="/verify-otp"
                state={{ email: email.trim().toLowerCase() }}
                className="text-indigo-600 dark:text-indigo-300 font-bold hover:underline ml-2 flex-shrink-0"
              >
                Verify OTP →
              </Link>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
          {/* Email */}
          <div className="login-anim">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Email Address <span className="text-red-500">*</span>
              </label>
              {touched.email && !errors.email && (
                <span className="text-emerald-500 text-[10px] flex items-center space-x-0.5 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Valid</span>
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={emailInputRef}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="name@example.com"
                className={`w-full glass-input pl-10 pr-4 py-3 rounded-xl text-xs transition ${
                  touched.email && errors.email
                    ? 'border-red-500/80 bg-red-500/5 focus:border-red-500'
                    : touched.email && !errors.email
                    ? 'border-emerald-500/60 focus:border-emerald-500'
                    : ''
                }`}
              />
            </div>
            {touched.email && errors.email && (
              <div className="flex items-center space-x-1 text-[11px] text-red-500 dark:text-red-400 mt-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="login-anim">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Password <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                className={`w-full glass-input pl-10 pr-11 py-3 rounded-xl text-xs transition ${
                  touched.password && errors.password
                    ? 'border-red-500/80 bg-red-500/5 focus:border-red-500'
                    : touched.password && !errors.password
                    ? 'border-emerald-500/60 focus:border-emerald-500'
                    : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.password && errors.password && (
              <div className="flex items-center space-x-1 text-[11px] text-red-500 dark:text-red-400 mt-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-anim w-full glow-btn py-3.5 px-4 rounded-xl text-white font-semibold font-outfit text-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-lg mt-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 login-anim pt-1 border-t border-slate-200 dark:border-slate-800/80">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
