'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import FloatingGradients from '../components/FloatingGradients';
import { useTheme } from '../components/ThemeProvider';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [profile, setProfile] = useState({
    fullName: '',
    mobileNumber: '',
    profilePictureUrl: '',
    email: '',
  });
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-black text-white' : 'bg-white text-gray-900';
  const cardBg = isDark
    ? 'bg-neutral-900/60 border border-neutral-800'
    : 'bg-white/60 border border-gray-200 shadow-sm';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-600';

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok) {
          setProfileError('Unable to load profile');
          setProfileLoading(false);
          return;
        }
        const data = await res.json();
        setProfile({
          fullName: data.fullName || '',
          mobileNumber: data.mobileNumber || '',
          profilePictureUrl: data.profilePictureUrl || '',
          email: data.email || '',
        });
      } catch (error) {
        setProfileError('Unable to load profile');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const avatarLetter = useMemo(() => {
    if (profile.fullName) return profile.fullName.charAt(0).toUpperCase();
    if (profile.email) return profile.email.charAt(0).toUpperCase();
    return '?';
  }, [profile.fullName, profile.email]);

  return (
    <div className={`min-h-screen ${bg} relative`}>
      <FloatingGradients />
      <ThemeToggle />
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`border-b ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            disabled={loading}
            className={`px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center space-y-4"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
            className={`text-6xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Hello World
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`${subtext} text-lg`}
          >
            Welcome to your dashboard
          </motion.p>
        </motion.div>

        {/* Optional: Add some cards or content */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.05, borderColor: "rgb(64, 64, 64)" }}
            className={`p-6 rounded-lg transition-all ${cardBg}`}
          >
            <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Getting Started</h3>
            <p className={`${subtext} text-sm`}>Welcome to your new dashboard. Start building something amazing.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            whileHover={{ scale: 1.05, borderColor: "rgb(64, 64, 64)" }}
            className={`p-6 rounded-lg transition-all ${cardBg}`}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="h-16 w-16 sm:h-14 sm:w-14 rounded-full overflow-hidden border border-dashed border-gray-300 dark:border-neutral-700 grid place-items-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-900 dark:to-neutral-800 flex-shrink-0">
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl sm:text-xl font-semibold text-gray-600 dark:text-gray-300">{avatarLetter}</span>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {profileLoading ? 'Loading...' : profile.fullName || 'Add your name'}
                </h3>
                <p className={`${subtext} text-sm`}>
                  {profileLoading ? 'Fetching details' : profile.mobileNumber || 'Add a mobile number'}
                </p>
              </div>
            </div>
            {profileError && <p className="text-xs text-red-500 mt-2 text-center">{profileError}</p>}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/profile')}
              className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'}`}
            >
              Edit Profile
            </motion.button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ scale: 1.05, borderColor: "rgb(64, 64, 64)" }}
            className={`p-6 rounded-lg transition-all ${cardBg}`}
          >
            <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Resources</h3>
            <p className={`${subtext} text-sm`}>Access documentation and helpful guides to get the most out of your account.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
