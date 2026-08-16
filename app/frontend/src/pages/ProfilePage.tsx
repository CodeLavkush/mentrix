import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateAcademicProfile } from '../store/slices/authSlice';
import { profileApi } from '../api/profileApi';
import CustomDropdown from '../components/CustomDropdown';
import { GraduationCap, Save, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import EditAvatarModal from '../components/EditAvatarModal';
import showToast from '../utils/toast';
import { getSafeAvatarUrl } from '../utils/format';

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const { user, academicDetails } = useAppSelector((state) => state.auth);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const [collegeName, setCollegeName] = useState(academicDetails?.collegeName || '');
  const [universityName, setUniversityName] = useState(academicDetails?.universityName || '');
  const [course, setCourse] = useState(academicDetails?.course || '');
  const [branch, setBranch] = useState(academicDetails?.branch || '');
  const [year, setYear] = useState(academicDetails?.year ? String(academicDetails.year) : '1');
  const [semester, setSemester] = useState(academicDetails?.semester ? String(academicDetails.semester) : '1');
  const [rollNumber, setRollNumber] = useState(academicDetails?.rollNumber ? String(academicDetails.rollNumber) : '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        '.profile-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileApi.getProfile();
        if (res.data) {
          setCollegeName(res.data.collegeName || '');
          setUniversityName(res.data.universityName || '');
          setCourse(res.data.course || '');
          setBranch(res.data.branch || '');
          if (res.data.year) setYear(String(res.data.year));
          if (res.data.semester) setSemester(String(res.data.semester));
          if (res.data.rollNumber) setRollNumber(String(res.data.rollNumber));
        }
      } catch {
        // Profile might not exist yet
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rollNumber && (isNaN(Number(rollNumber)) || Number(rollNumber) < 0)) {
      showToast.warning('Please enter a valid numeric roll number.');
      return;
    }

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const payload = {
      collegeName: collegeName.trim(),
      universityName: universityName.trim(),
      course: course.trim(),
      branch: branch.trim(),
      year: year ? Number(year) : undefined,
      semester: semester ? Number(semester) : undefined,
      rollNumber: rollNumber ? Number(rollNumber) : undefined,
    };

    const toastId = showToast.loading('Saving academic profile details...');
    const result = await dispatch(updateAcademicProfile(payload));
    setSaving(false);
    if (updateAcademicProfile.fulfilled.match(result)) {
      showToast.dismiss(toastId);
      setSuccessMsg('Academic profile updated successfully!');
      showToast.success('Academic profile saved successfully!');
    } else {
      showToast.dismiss(toastId);
      const err = (result.payload as string) || 'Failed to update academic details.';
      setErrorMsg(err);
      showToast.error(err);
    }
  };

  const yearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
    { value: '5', label: '5th Year' },
  ];

  const semesterOptions = [
    { value: '1', label: 'Semester 1' },
    { value: '2', label: 'Semester 2' },
    { value: '3', label: 'Semester 3' },
    { value: '4', label: 'Semester 4' },
    { value: '5', label: 'Semester 5' },
    { value: '6', label: 'Semester 6' },
    { value: '7', label: 'Semester 7' },
    { value: '8', label: 'Semester 8' },
  ];

  return (
    <div ref={pageRef} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 font-inter max-w-4xl mx-auto">
      {/* Account Info Card */}
      <div className="profile-card glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
          <div
            onClick={() => setIsAvatarModalOpen(true)}
            className="relative group cursor-pointer flex-shrink-0"
            title="Click to edit your profile picture"
          >
            {getSafeAvatarUrl(user?.avatarUrl) ? (
              <img
                src={getSafeAvatarUrl(user?.avatarUrl)}
                alt={user?.username || 'Student'}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg group-hover:border-indigo-400 group-hover:scale-105 transition-all duration-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-outfit font-extrabold text-2xl text-indigo-500 dark:text-indigo-300 flex-shrink-0 shadow-md group-hover:scale-105 transition-all duration-200">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:bg-indigo-500 group-hover:scale-110 transition-transform">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-outfit text-slate-900 dark:text-white">
              {user?.username || 'Student User'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              <span>
                Gender: <strong className="text-slate-800 dark:text-slate-200">{user?.gender || 'N/A'}</strong>
              </span>
              <span>•</span>
              <span>
                Age: <strong className="text-slate-800 dark:text-slate-200">{user?.age || 'N/A'}</strong>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                  user?.isEmailVerified
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}
              >
                {user?.isEmailVerified ? 'Verified Account' : 'Unverified Email'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAvatarModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-sm"
        >
          <Camera className="w-4 h-4" />
          <span>Change Picture</span>
        </button>
      </div>

      {/* Academic Details Form */}
      <div className="profile-card glass-card p-5 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-lg sm:text-xl font-bold font-outfit text-slate-900 dark:text-white flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 dark:text-indigo-400" />
            <span>Academic Details</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure your college, university, and course information</p>
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">College Name</label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full glass-input px-4 py-3 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">University Name</label>
              <input
                type="text"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder="e.g. State University"
                className="w-full glass-input px-4 py-3 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Course / Major</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full glass-input px-4 py-3 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Branch / Specialization</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                className="w-full glass-input px-4 py-3 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Year</label>
              <CustomDropdown
                options={yearOptions}
                value={year}
                onChange={setYear}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Semester</label>
              <CustomDropdown
                options={semesterOptions}
                value={semester}
                onChange={setSemester}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Roll Number</label>
              <input
                type="number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="101"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto glow-btn px-6 py-3 rounded-xl text-white font-semibold text-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Academic Details'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Edit Profile Picture Modal */}
      <EditAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
