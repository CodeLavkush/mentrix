import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser, clearAuthError } from '../store/slices/authSlice';
import CustomDropdown from '../components/CustomDropdown';
import { Lock, Mail, User as UserIcon, Camera, AlertCircle, Eye, EyeOff, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import mentrixLogo from '../assets/mentrix_logo.png';
import showToast from '../utils/toast';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState('MALE');
  const [age, setAge] = useState('20');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Field touch tracking for clean validation UX
  const [touched, setTouched] = useState<{
    username?: boolean;
    email?: boolean;
    password?: boolean;
    age?: boolean;
    avatar?: boolean;
  }>({});

  const cardRef = useRef<HTMLDivElement | null>(null);
  const usernameInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const ageInputRef = useRef<HTMLInputElement | null>(null);

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
        '.reg-anim',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.15 }
      );
    }
  }, []);

  // Compute password strength score (0 to 3)
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password) && password.length >= 10) score += 1;

    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-amber-500' };
    if (score === 2) return { score: 2, label: 'Good', color: 'bg-blue-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  }, [password]);

  // Validation errors
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    // Username validation
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      errs.username = 'Username is required';
    } else if (trimmedUsername.length < 3) {
      errs.username = 'Username must be at least 3 characters long';
    } else if (trimmedUsername.length > 30) {
      errs.username = 'Username cannot exceed 30 characters';
    } else if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      errs.username = 'Only lowercase letters, numbers, and underscores allowed';
    }

    // Email validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address (e.g. name@example.com)';
    }

    // Password validation
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters long';
    }

    // Age validation
    const numAge = Number(age);
    if (!age || isNaN(numAge)) {
      errs.age = 'Age is required and must be a number';
    } else if (numAge < 5 || numAge > 120) {
      errs.age = 'Age must be between 5 and 120 years';
    }

    return errs;
  }, [username, email, password, age]);

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        showToast.error('Please upload a valid image file (JPEG, PNG, or WEBP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast.error('Avatar file size must be less than 5MB');
        return;
      }
      setAvatar(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      showToast.success('Profile photo selected');
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      username: true,
      email: true,
      password: true,
      age: true,
      avatar: true,
    });

    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      if (firstKey === 'username') usernameInputRef.current?.focus();
      else if (firstKey === 'email') emailInputRef.current?.focus();
      else if (firstKey === 'password') passwordInputRef.current?.focus();
      else if (firstKey === 'age') ageInputRef.current?.focus();

      showToast.warning(`Please check your inputs: ${Object.values(errors)[0]}`);
      return;
    }

    const formData = new FormData();
    formData.append('username', username.trim().toLowerCase());
    formData.append('email', email.trim().toLowerCase());
    formData.append('password', password);
    formData.append('gender', gender);
    formData.append('age', age);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    const toastId = showToast.loading('Creating your Mentrix account...');
    const result = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(result)) {
      showToast.dismiss(toastId);
      showToast.success('Account created! Please check your email for the 6-digit OTP code.');
      navigate('/verify-otp', { state: { email: email.trim().toLowerCase() } });
    } else if (registerUser.rejected.match(result)) {
      showToast.dismiss(toastId);
      const errorMsg = (result.payload as string) || 'Registration failed. Please try again.';
      showToast.error(errorMsg);
    }
  };

  const genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-mentrix-bg flex items-center justify-center p-4 font-inter relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div
        ref={cardRef}
        className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 space-y-5"
      >
        {/* Header */}
        <div className="text-center">
          <img
            src={mentrixLogo}
            alt="Mentrix Logo"
            className="w-14 h-14 object-contain mx-auto mb-2 drop-shadow-xl reg-anim"
          />
          <h1 className="text-2xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-wide reg-anim">
            Create Mentrix Account
          </h1>
          <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider reg-anim mt-0.5">
            AI Powered Student Assistant
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 reg-anim">
            Join and unlock your intelligent study workspace
          </p>
        </div>

        {/* Server Error Alert Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes('already exists') && (
              <Link
                to="/login"
                className="text-indigo-600 dark:text-indigo-300 font-bold hover:underline ml-2 flex-shrink-0"
              >
                Sign In →
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center reg-anim">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500/50 bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-7 h-7 text-indigo-500 dark:text-indigo-400/60" />
                )}
              </div>

              {/* Upload Overlay */}
              <label
                htmlFor="avatar-input"
                className="absolute inset-0 bg-slate-950/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200"
              >
                <Camera className="w-4 h-4 text-white" />
              </label>
              <input
                id="avatar-input"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />

              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-0.5 shadow transition cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Profile Photo <span className="text-[10px] text-slate-400 dark:text-slate-500">(Optional)</span>
            </span>
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 reg-anim">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Username <span className="text-red-500">*</span>
                </label>
                {touched.username && !errors.username && (
                  <span className="text-emerald-500 text-[10px] flex items-center space-x-0.5 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Valid</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={usernameInputRef}
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  onBlur={() => handleBlur('username')}
                  placeholder="e.g. alex_student"
                  className={`w-full glass-input pl-9 pr-3 py-2.5 rounded-xl text-xs transition ${
                    touched.username && errors.username
                      ? 'border-red-500/80 bg-red-500/5 focus:border-red-500'
                      : touched.username && !errors.username
                      ? 'border-emerald-500/60 focus:border-emerald-500'
                      : ''
                  }`}
                />
              </div>
              {touched.username && errors.username && (
                <div className="flex items-center space-x-1 text-[11px] text-red-500 dark:text-red-400 mt-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Email <span className="text-red-500">*</span>
                </label>
                {touched.email && !errors.email && (
                  <span className="text-emerald-500 text-[10px] flex items-center space-x-0.5 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Valid</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={emailInputRef}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="name@example.com"
                  className={`w-full glass-input pl-9 pr-3 py-2.5 rounded-xl text-xs transition ${
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
          </div>

          {/* Password */}
          <div className="reg-anim">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Password <span className="text-red-500">*</span>
              </label>
              {password && (
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  <span>Strength: {passwordStrength.label}</span>
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="At least 6 characters"
                className={`w-full glass-input pl-9 pr-10 py-2.5 rounded-xl text-xs transition ${
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Password strength mini bar */}
            {password && (
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5 flex gap-1">
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} />
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} />
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} />
              </div>
            )}

            {touched.password && errors.password && (
              <div className="flex items-center space-x-1 text-[11px] text-red-500 dark:text-red-400 mt-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Gender & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 reg-anim relative z-20">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
                Gender <span className="text-red-500">*</span>
              </label>
              <CustomDropdown
                options={genderOptions}
                value={gender}
                onChange={setGender}
                placeholder="Select Gender"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                ref={ageInputRef}
                type="number"
                min="5"
                max="120"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onBlur={() => handleBlur('age')}
                className={`w-full glass-input px-3 py-2.5 rounded-xl text-xs transition ${
                  touched.age && errors.age
                    ? 'border-red-500/80 bg-red-500/5 focus:border-red-500'
                    : ''
                }`}
              />
              {touched.age && errors.age && (
                <div className="flex items-center space-x-1 text-[11px] text-red-500 dark:text-red-400 mt-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.age}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="reg-anim w-full glow-btn py-3 px-4 rounded-xl text-white font-semibold font-outfit text-sm cursor-pointer disabled:opacity-50 mt-3 shadow-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <span>Complete Registration</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 reg-anim pt-1 border-t border-slate-200 dark:border-slate-800/80">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
