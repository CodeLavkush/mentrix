import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateAcademicProfile } from '../store/slices/authSlice';
import { profileApi } from '../api/profileApi';
import CustomDropdown from '../components/CustomDropdown';
import { GraduationCap, Save, CheckCircle, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const { user, academicDetails } = useAppSelector((state) => state.auth);

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
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const payload = {
      collegeName,
      universityName,
      course,
      branch,
      year: year ? Number(year) : undefined,
      semester: semester ? Number(semester) : undefined,
      rollNumber: rollNumber ? Number(rollNumber) : undefined,
    };

    const toastId = toast.loading('Saving academic profile...');
    const result = await dispatch(updateAcademicProfile(payload));
    setSaving(false);
    if (updateAcademicProfile.fulfilled.match(result)) {
      setSuccessMsg('Academic details updated successfully!');
      toast.success('Academic profile saved!', { id: toastId });
    } else {
      const err = (result.payload as string) || 'Failed to update academic details.';
      setErrorMsg(err);
      toast.error(err, { id: toastId });
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
      <div className="profile-card glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5 shadow-xl">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-outfit font-extrabold text-2xl text-indigo-500 dark:text-indigo-300 flex-shrink-0 shadow-md">
          {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-outfit text-slate-900 dark:text-white">{user?.username || 'Student User'}</h1>
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
                user?.isEmailVerified ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}
            >
              {user?.isEmailVerified ? 'Verified Account' : 'Unverified Email'}
            </span>
          </div>
        </div>
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
    </div>
  );
};

export default ProfilePage;
