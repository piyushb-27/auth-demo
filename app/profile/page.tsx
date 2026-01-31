'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Leaf } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import BotanicalGradients from '../components/BotanicalGradients';
import { useTheme } from '../components/ThemeProvider';
import { pageVariants, buttonAnimation, transitions } from '@/lib/animations';

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned';

type Status = { type: 'success' | 'error'; message: string } | null;

type Profile = {
  email: string;
  fullName: string;
  mobileNumber: string;
  profilePictureUrl: string;
};

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: { event: string; info?: { secure_url?: string } }) => void
      ) => { open: () => void };
    };
  }
}

export default function ProfilePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    email: '',
    fullName: '',
    mobileNumber: '',
    profilePictureUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const widgetRef = useRef<{ open: () => void } | null>(null);

  // Load Cloudinary widget script
  useEffect(() => {
    if (!cloudName) return;
    if (typeof window === 'undefined') return;
    if (document.getElementById('cloudinary-widget-script')) return;

    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.id = 'cloudinary-widget-script';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Fetch existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok) {
          setStatus({ type: 'error', message: 'Unable to load profile. Please try again.' });
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProfile({
          email: data.email || '',
          fullName: data.fullName || '',
          mobileNumber: data.mobileNumber || '',
          profilePictureUrl: data.profilePictureUrl || '',
        });
      } catch (error) {
        setStatus({ type: 'error', message: 'Failed to load profile.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const avatarLetter = useMemo(() => {
    if (profile.fullName) return profile.fullName.charAt(0).toUpperCase();
    if (profile.email) return profile.email.charAt(0).toUpperCase();
    return '?';
  }, [profile.fullName, profile.email]);

  const openUploadWidget = () => {
    setStatus(null);
    if (!cloudName) {
      setStatus({ type: 'error', message: 'Cloudinary cloud name is missing. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.' });
      return;
    }

    if (typeof window === 'undefined') return;
    if (!window.cloudinary) {
      setStatus({ type: 'error', message: 'Cloudinary widget not ready yet. Please try again in a moment.' });
      return;
    }

    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: ['local', 'url', 'camera'],
          multiple: false,
          cropping: true,
          croppingAspectRatio: 1,
          maxImageFileSize: 5_000_000,
          folder: 'profile_pictures',
          clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
        },
        (error, result) => {
          if (error) {
            setStatus({ type: 'error', message: 'Upload failed. Please try again.' });
            return;
          }
          if (result.event === 'success' && result.info?.secure_url) {
            setProfile((prev) => ({ ...prev, profilePictureUrl: result.info!.secure_url || '' }));
            setStatus({ type: 'success', message: 'Image uploaded. Save to apply.' });
          }
        }
      );
    }

    widgetRef.current?.open();
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profile.fullName,
          mobileNumber: profile.mobileNumber,
          profilePictureUrl: profile.profilePictureUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: 'error', message: data.error || 'Could not save profile.' });
        setSaving(false);
        return;
      }

      setProfile((prev) => ({
        ...prev,
        fullName: data.fullName || prev.fullName,
        mobileNumber: data.mobileNumber || prev.mobileNumber,
        profilePictureUrl: data.profilePictureUrl || prev.profilePictureUrl,
      }));
      setStatus({ type: 'success', message: 'Profile preserved.' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 relative ${isDark ? 'bg-[#1A1F1C]' : 'bg-[#F9F8F4]'}`}>
      <BotanicalGradients />
      <ThemeToggle />
      
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        className={`w-full max-w-xl relative z-10`}
      >
        {/* Decorative Arch */}
        <div className={`h-20 rounded-t-[80px] mb-[-1px] ${isDark ? 'bg-[#242B26]' : 'bg-[#DCCFC2]/40'}`}>
          <div className="h-full w-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, ...transitions.normal }}
              className="text-3xl"
            >
              🪴
            </motion.div>
          </div>
        </div>

        {/* Card */}
        <div className={`${isDark ? 'bg-[#242B26]/80' : 'bg-white/80'} backdrop-blur-sm border ${isDark ? 'border-[#E6E2DA]/20' : 'border-[#E6E2DA]'} rounded-b-3xl p-8 shadow-lift`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, ...transitions.normal }}
            className="mb-8 flex items-start justify-between gap-4"
          >
            <div>
              <h1 className={`font-serif text-2xl mb-1 ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                Your <em className="italic">Profile</em>
              </h1>
              <p className={`font-sans text-sm ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>Update your details and avatar</p>
            </div>
            <motion.button
              {...buttonAnimation}
              className={`hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all duration-300 items-center gap-2 ${isDark ? 'border-[#E6E2DA]/30 text-[#8C9A84] hover:border-[#8C9A84] hover:text-[#F9F8F4]' : 'border-[#E6E2DA] text-[#8C9A84] hover:border-[#8C9A84] hover:text-[#2D3A31]'}`}
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              <span>Back</span>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, ...transitions.normal }}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8"
          >
            <div className="flex flex-col items-center gap-3">
              {/* Arch-shaped Avatar */}
              <div className={`w-24 h-28 rounded-t-full rounded-b-3xl overflow-hidden border-2 ${isDark ? 'border-[#E6E2DA]/30 bg-[#1A1F1C]' : 'border-[#E6E2DA] bg-[#DCCFC2]/30'} flex items-center justify-center`}>
                {profile.profilePictureUrl ? (
                  <img
                    src={profile.profilePictureUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className={`font-serif text-3xl ${isDark ? 'text-[#C27B66]' : 'text-[#C27B66]'}`}>{avatarLetter}</span>
                )}
              </div>
              <motion.button
                {...buttonAnimation}
                onClick={openUploadWidget}
                className={`px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all duration-300 flex items-center gap-2 ${isDark ? 'border-[#E6E2DA]/30 text-[#8C9A84] hover:border-[#8C9A84] hover:bg-[#8C9A84]/10' : 'border-[#E6E2DA] text-[#8C9A84] hover:border-[#8C9A84] hover:bg-[#8C9A84]/10'}`}
              >
                <Upload className="w-4 h-4" strokeWidth={1.5} />
                <span>Upload photo</span>
              </motion.button>
              {!cloudName && (
                <p className="text-xs text-[#C27B66] text-center px-2 font-sans">Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to enable uploads.</p>
              )}
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className={`text-sm font-sans mb-2 block ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>Full name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile((prev) => ({ ...prev, fullName: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-2xl font-sans ${isDark ? 'bg-[#1A1F1C]/50 border-[#E6E2DA]/20 text-[#F9F8F4] placeholder-[#8C9A84]/50' : 'bg-[#DCCFC2]/30 border-[#E6E2DA] text-[#2D3A31] placeholder-[#8C9A84]'} border focus:outline-none focus:border-[#8C9A84] transition-all duration-300`}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
              <div>
                <label className={`text-sm font-sans mb-2 block ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>Mobile number</label>
                <input
                  type="tel"
                  value={profile.mobileNumber}
                  onChange={(e) => setProfile((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-2xl font-sans ${isDark ? 'bg-[#1A1F1C]/50 border-[#E6E2DA]/20 text-[#F9F8F4] placeholder-[#8C9A84]/50' : 'bg-[#DCCFC2]/30 border-[#E6E2DA] text-[#2D3A31] placeholder-[#8C9A84]'} border focus:outline-none focus:border-[#8C9A84] transition-all duration-300`}
                  placeholder="e.g. +1 555 123 4567"
                  disabled={loading}
                />
              </div>
              <div>
                <label className={`text-sm font-sans mb-2 block ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>Email</label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className={`w-full px-4 py-3 rounded-2xl font-sans border border-dashed cursor-not-allowed ${isDark ? 'bg-[#1A1F1C]/30 border-[#E6E2DA]/20 text-[#8C9A84]/70' : 'bg-[#DCCFC2]/20 border-[#E6E2DA] text-[#8C9A84]'}`}
                />
              </div>
            </div>
          </motion.div>

          {status && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transitions.fast}
              className={`mb-4 text-sm font-sans px-4 py-3 rounded-2xl flex items-center gap-2 ${
                status.type === 'success'
                  ? (isDark ? 'bg-[#8C9A84]/10 text-[#8C9A84] border border-[#8C9A84]/20' : 'bg-[#8C9A84]/10 text-[#8C9A84] border border-[#8C9A84]/20')
                  : 'bg-terracotta/10 text-[#C27B66] border border-terracotta/20'
              }`}
            >
              <Leaf className="w-4 h-4" strokeWidth={1.5} />
              {status.message}
            </motion.div>
          )}

          <motion.button
            {...buttonAnimation}
            type="button"
            disabled={saving || loading}
            onClick={handleSave}
            className={`w-full py-3.5 rounded-full font-sans font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-[#8C9A84] text-[#F9F8F4] hover:bg-[#8C9A84]/90' : 'bg-[#2D3A31] text-[#F9F8F4] hover:bg-[#4A5D4E]'}`}
          >
            {loading ? 'Loading profile...' : saving ? 'Preserving...' : 'Save changes'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
