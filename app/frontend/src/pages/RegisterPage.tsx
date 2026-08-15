import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser, clearAuthError } from '../store/slices/authSlice';
import CustomDropdown from '../components/CustomDropdown';
import { Lock, Mail, User as UserIcon, Camera, AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import mentrixLogo from '../assets/mentrix_logo.png';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState('MALE');
  const [age, setAge] = useState('20');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
        '.reg-anim',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) return;

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('gender', gender);
    formData.append('age', age);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Please enter the 6-digit OTP sent to your email.');
      navigate('/verify-otp', { state: { email } });
    } else if (registerUser.rejected.match(result)) {
      toast.error((result.payload as string) || 'Registration failed');
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

      <div
        ref={cardRef}
        className="w-full max-w-lg glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <img
            src={mentrixLogo}
            alt="Mentrix Logo"
            className="w-14 h-14 object-contain mx-auto mb-2 drop-shadow-xl reg-anim"
          />
          <h1 className="text-2xl font-extrabold font-outfit text-white tracking-wide reg-anim">
            Mentrix
          </h1>
          <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider reg-anim mt-0.5">
            AI Powered Student Assistant
          </p>
          <p className="text-slate-400 text-xs mt-1.5 reg-anim">Join and unlock your study workspace</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Small Circular Profile Pic Preview */}
          <div className="flex flex-col items-center justify-center reg-anim">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500/50 bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-7 h-7 text-indigo-500 dark:text-indigo-400/60" />
                )}
              </div>

              {/* Upload Overlay Button */}
              <label
                htmlFor="avatar-input"
                className="absolute inset-0 bg-slate-950/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200"
              >
                <Camera className="w-4 h-4 text-white" />
              </label>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-0.5 shadow transition cursor-pointer"
                  title="Remove avatar"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Profile Photo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 reg-anim">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Username</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full glass-input pl-9 pr-3 py-2.5 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full glass-input pl-9 pr-3 py-2.5 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="reg-anim">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input pl-9 pr-9 py-2.5 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 reg-anim relative z-20">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Gender</label>
              <CustomDropdown
                options={genderOptions}
                value={gender}
                onChange={setGender}
                placeholder="Select Gender"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Age</label>
              <input
                type="number"
                min="5"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="reg-anim w-full glow-btn py-3 px-4 rounded-xl text-white font-semibold font-outfit text-sm cursor-pointer disabled:opacity-50 mt-2 shadow-lg"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 reg-anim">
          Already registered?{' '}
          <Link to="/login" className="text-mentrix-accent font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
