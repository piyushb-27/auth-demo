'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, BookOpen, Leaf } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import BotanicalGradients from '../components/BotanicalGradients';
import { useTheme } from '../components/ThemeProvider';
import { pageVariants, cardVariants, staggerContainer, buttonAnimation, transitions, cardAnimation } from '@/lib/animations';

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
    <div className={`min-h-screen ${isDark ? 'bg-[#1A1F1C]' : 'bg-[#F9F8F4]'} relative`}>
      <BotanicalGradients />
      <ThemeToggle />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={transitions.enter}
        className={`border-b ${isDark ? 'border-[#E6E2DA]/20' : 'border-[#E6E2DA]/50'}`}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className={`font-serif text-xl ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>Dashboard</div>
          <motion.button
            {...buttonAnimation}
            onClick={handleLogout}
            disabled={loading}
            className={`px-4 py-2 text-sm font-sans transition-all duration-300 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'text-[#8C9A84] hover:text-[#F9F8F4] hover:bg-[#242B26]' : 'text-[#8C9A84] hover:text-[#2D3A31] hover:bg-[#DCCFC2]/30'}`}
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span>{loading ? 'Leaving...' : 'Logout'}</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-16 relative z-10">
        <motion.div 
          variants={pageVariants}
          initial="initial"
          animate="enter"
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, ...transitions.normal }}
            className="text-5xl mb-4"
          >
            ✦
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, ...transitions.normal }}
            className={`font-serif text-5xl tracking-tight ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}
          >
            Welcome <em className="italic">back</em>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, ...transitions.normal }}
            className={`font-sans ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'} text-lg`}
          >
            Your personal workspace awaits
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="enter"
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"
        >
          <motion.div
            variants={cardVariants}
            {...cardAnimation}
            className={`p-6 rounded-3xl transition-all duration-500 ${isDark ? 'bg-[#242B26]' : 'bg-white'} shadow-paper hover:shadow-lift`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-[#8C9A84]/20' : 'bg-[#DCCFC2]'}`}>
              <Leaf className={`w-5 h-5 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
            </div>
            <h3 className={`font-serif text-xl mb-2 ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>Getting Started</h3>
            <p className={`font-sans text-sm ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>Welcome to Jot. Start capturing your thoughts and ideas.</p>
          </motion.div>
          
          <motion.div
            variants={cardVariants}
            {...cardAnimation}
            className={`p-6 rounded-3xl transition-all duration-500 ${isDark ? 'bg-[#242B26]' : 'bg-white'} shadow-paper hover:shadow-lift`}
          >
            <div className="flex flex-col items-center gap-4">
              {/* Profile Avatar - Arch Shape */}
              <div className={`w-20 h-24 rounded-t-full rounded-b-3xl overflow-hidden border-2 ${isDark ? 'border-[#E6E2DA]/30 bg-[#1A1F1C]' : 'border-[#E6E2DA] bg-[#DCCFC2]/30'} flex items-center justify-center`}>
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className={`font-serif text-2xl ${isDark ? 'text-[#C27B66]' : 'text-[#C27B66]'}`}>{avatarLetter}</span>
                )}
              </div>
              <div className="text-center">
                <h3 className={`font-serif text-lg ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                  {profileLoading ? 'Loading...' : profile.fullName || 'Add your name'}
                </h3>
                <p className={`font-sans text-sm ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
                  {profileLoading ? 'Fetching details' : profile.mobileNumber || 'Add a mobile number'}
                </p>
              </div>
            </div>
            {profileError && <p className="text-xs text-[#C27B66] mt-2 text-center font-sans">{profileError}</p>}
            <motion.button
              {...buttonAnimation}
              onClick={() => router.push('/profile')}
              className={`mt-4 w-full py-2.5 rounded-full text-sm font-sans font-medium transition-all duration-300 ${isDark ? 'bg-[#8C9A84] text-[#F9F8F4] hover:bg-[#8C9A84]/90' : 'bg-[#2D3A31] text-[#F9F8F4] hover:bg-[#4A5D4E]'}`}
            >
              Edit Profile
            </motion.button>
          </motion.div>
          
          <motion.div
            variants={cardVariants}
            {...cardAnimation}
            className={`p-6 rounded-3xl transition-all duration-500 ${isDark ? 'bg-[#242B26]' : 'bg-white'} shadow-paper hover:shadow-lift`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-[#8C9A84]/20' : 'bg-[#DCCFC2]'}`}>
              <BookOpen className={`w-5 h-5 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
            </div>
            <h3 className={`font-serif text-xl mb-2 ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>Your Notes</h3>
            <p className={`font-sans text-sm ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'} mb-4`}>Access your collection of thoughts and continue writing.</p>
            <motion.button
              {...buttonAnimation}
              onClick={() => router.push('/notes')}
              className={`w-full py-2.5 rounded-full text-sm font-sans font-medium transition-all duration-300 border ${isDark ? 'border-[#8C9A84] text-[#8C9A84] hover:bg-[#8C9A84] hover:text-[#F9F8F4]' : 'border-[#2D3A31] text-[#2D3A31] hover:bg-[#2D3A31] hover:text-[#F9F8F4]'}`}
            >
              View Notes
            </motion.button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
