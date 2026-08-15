import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import gsap from 'gsap';
import { authApi } from '../api/authApi';
import { Mail, CheckCircle, ArrowRight, RotateCcw, ArrowLeft, ShieldAlert } from 'lucide-react';
import mentrixLogo from '../assets/mentrix_logo.png';
import showToast from '../utils/toast';

export const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from router state or query param
  const queryEmail = new URLSearchParams(location.search).get('email');
  const initialEmail = (location.state as { email?: string })?.email || queryEmail || '';

  const [email, setEmail] = useState(initialEmail);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [emailTouched, setEmailTouched] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.94, opacity: 0, y: 25 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.3)' }
      );
      gsap.fromTo(
        '.otp-anim',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out', delay: 0.15 }
      );
    }
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newOtp = [...otpValues];
      newOtp[index] = '';
      setOtpValues(newOtp);
      return;
    }

    // Handle single digit
    const digit = cleaned.slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = digit;
    setOtpValues(newOtp);
    setError(null);

    // Auto-focus next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits filled
    const fullOtp = newOtp.join('');
    if (fullOtp.length === 6 && isEmailValid) {
      submitVerification(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) {
      showToast.warning('Please paste a valid numeric 6-digit code');
      return;
    }

    const newOtp = [...otpValues];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtpValues(newOtp);
    setError(null);

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();

    if (pastedData.length === 6 && isEmailValid) {
      submitVerification(pastedData);
    } else if (pastedData.length < 6) {
      showToast.info(`Pasted ${pastedData.length} digits. Please enter the remaining digits.`);
    }
  };

  const submitVerification = async (otpCode: string) => {
    setEmailTouched(true);

    if (!email.trim()) {
      setError('Please provide your registered email address');
      showToast.warning('Please enter your email address');
      return;
    }

    if (!isEmailValid) {
      setError('Please enter a valid email address');
      showToast.warning('Invalid email address format');
      return;
    }

    if (otpCode.length !== 6 || !/^[0-9]{6}$/.test(otpCode)) {
      setError('Please enter all 6 numeric digits of the OTP');
      showToast.warning('Please complete all 6 digits of the OTP');
      return;
    }

    setLoading(true);
    setError(null);
    const toastId = showToast.loading('Verifying your 6-digit OTP code...');

    try {
      await authApi.verifyEmail(otpCode, email.trim().toLowerCase());
      showToast.dismiss(toastId);
      showToast.success('Email verified successfully! Please sign in to your account.');
      setTimeout(() => {
        navigate('/login', { state: { email: email.trim().toLowerCase() } });
      }, 1000);
    } catch (err: any) {
      showToast.dismiss(toastId);
      const msg = err.response?.data?.message || err.message || 'OTP verification failed. Please check the code and try again.';
      setError(msg);
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVerification(otpValues.join(''));
  };

  const handleResendOtp = async () => {
    if (timer > 0 || !email.trim() || resending) return;

    if (!isEmailValid) {
      showToast.warning('Please provide a valid registered email to resend OTP');
      return;
    }

    setResending(true);
    const toastId = showToast.loading('Sending fresh 6-digit OTP to your email...');
    try {
      await authApi.resendEmailVerification(email.trim().toLowerCase());
      showToast.dismiss(toastId);
      showToast.success('A new 6-digit OTP has been sent to your email!');
      setTimer(60);
      setOtpValues(['', '', '', '', '', '']);
      setError(null);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      showToast.dismiss(toastId);
      const msg = err.response?.data?.message || err.message || 'Failed to resend OTP. Please try again.';
      showToast.error(msg);
    } finally {
      setResending(false);
    }
  };

  const filledCount = otpValues.filter((v) => v !== '').length;

  return (
    <div className="min-h-screen bg-mentrix-bg flex items-center justify-center p-4 font-inter relative overflow-hidden">
      {/* Ambient Glow Atmosphere */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div
        ref={cardRef}
        className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src={mentrixLogo}
            alt="Mentrix Logo"
            className="w-14 h-14 object-contain mx-auto mb-1 drop-shadow-xl otp-anim"
          />
          <h1 className="text-2xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-wide otp-anim">
            Verify Your Email
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 otp-anim max-w-xs mx-auto leading-relaxed">
            Enter the 6-digit verification code sent to
          </p>
          {initialEmail ? (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-600/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-semibold text-xs otp-anim">
              <Mail className="w-3.5 h-3.5" />
              <span>{email}</span>
            </div>
          ) : (
            <div className="space-y-1 otp-anim">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="Enter your registered email address"
                className={`w-full glass-input px-4 py-2.5 rounded-xl text-xs text-center font-medium transition ${
                  emailTouched && !isEmailValid
                    ? 'border-red-500/80 bg-red-500/5 focus:border-red-500'
                    : ''
                }`}
              />
              {emailTouched && !isEmailValid && (
                <p className="text-[11px] text-red-500 dark:text-red-400 text-center">
                  Please enter a valid email address
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 6-Digit OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-2 sm:gap-2.5 otp-anim">
              {otpValues.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-bold text-xl sm:text-2xl rounded-2xl border transition-all duration-200 focus:outline-none focus:scale-105 shadow-sm ${
                    digit
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-600/20 text-indigo-600 dark:text-white shadow-indigo-500/10'
                      : error
                      ? 'border-red-500/50 bg-red-500/5 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 px-1">
              <span>{filledCount} of 6 digits entered</span>
              {filledCount === 6 && (
                <span className="text-emerald-500 font-semibold flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Ready to verify</span>
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || filledCount !== 6}
            className="w-full glow-btn py-3.5 px-4 rounded-xl text-white font-semibold font-outfit text-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-lg otp-anim"
          >
            {loading ? (
              <span>Verifying Code...</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Verify & Proceed</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Resend OTP Section */}
        <div className="pt-2 text-center text-xs space-y-3 otp-anim border-t border-slate-200 dark:border-slate-800/80">
          <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1.5">
            <span>Didn't receive the code?</span>
            {timer > 0 ? (
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                Resend in {timer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending || !email.trim()}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resend OTP</span>
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
            <Link
              to="/register"
              className="hover:text-indigo-600 dark:hover:text-white transition flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Register</span>
            </Link>
            <Link
              to="/login"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
