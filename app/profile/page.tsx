'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import FloatingGradients from '../components/FloatingGradients';
import { useTheme } from '../components/ThemeProvider';

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
      setStatus({ type: 'success', message: 'Profile saved.' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const bg = isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900';
  const cardBg = isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-white border-gray-200 shadow-sm';
  const inputStyles = isDark
    ? 'bg-neutral-900 border border-neutral-800 text-white placeholder-gray-500'
    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500';
  const buttonStyles = isDark
    ? 'bg-white text-black hover:bg-gray-100'
    : 'bg-black text-white hover:bg-gray-900';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 ${bg} relative`}>
      <FloatingGradients />
      <ThemeToggle />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-xl rounded-xl border ${cardBg} p-6 sm:p-8 backdrop-blur`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 flex items-start justify-between gap-4"
        >
          <div>
            <h1 className={`text-2xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile</h1>
            <p className={`text-sm ${subtext}`}>Update your details and avatar</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isDark ? 'border-neutral-800 hover:border-neutral-600' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => router.push('/dashboard')}
          >
            Back
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-24 w-24 rounded-full overflow-hidden border border-dashed border-gray-300 dark:border-neutral-700 grid place-items-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-900 dark:to-neutral-800">
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-semibold text-gray-600 dark:text-gray-300">{avatarLetter}</span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openUploadWidget}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isDark ? 'border-neutral-800 hover:border-neutral-700' : 'border-gray-200 hover:border-gray-300'}`}
            >
              Upload photo
            </motion.button>
            {!cloudName && (
              <p className="text-xs text-red-500 text-center px-2">Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to enable uploads.</p>
            )}
          </div>

          <div className="flex-1 w-full space-y-4">
            <div>
              <label className={`text-sm mb-1 block ${subtext}`}>Full name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile((prev) => ({ ...prev, fullName: e.target.value }))}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:scale-[1.01] focus:border-neutral-700 transition-all duration-200 ${inputStyles}`}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
            <div>
              <label className={`text-sm mb-1 block ${subtext}`}>Mobile number</label>
              <input
                type="tel"
                value={profile.mobileNumber}
                onChange={(e) => setProfile((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:scale-[1.01] focus:border-neutral-700 transition-all duration-200 ${inputStyles}`}
                placeholder="e.g. +1 555 123 4567"
                disabled={loading}
              />
            </div>
            <div>
              <label className={`text-sm mb-1 block ${subtext}`}>Email</label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className={`w-full px-4 py-3 rounded-lg border border-dashed ${isDark ? 'bg-neutral-900 border-neutral-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'} cursor-not-allowed`}
              />
            </div>
          </div>
        </motion.div>

        {status && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 text-sm px-3 py-2 rounded-lg border ${
              status.type === 'success'
                ? 'border-green-500/40 text-green-500 bg-green-500/5'
                : 'border-red-500/40 text-red-500 bg-red-500/5'
            }`}
          >
            {status.message}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          disabled={saving || loading}
          onClick={handleSave}
          className={`w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles}`}
        >
          {loading ? 'Loading profile...' : saving ? 'Saving...' : 'Save changes'}
        </motion.button>
      </motion.div>
    </div>
  );
}
