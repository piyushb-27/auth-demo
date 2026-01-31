'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, Image, File, Trash2, X, Search, 
  Menu, ChevronLeft, ChevronRight, Download, Eye, 
  Folder, Grid, List, Filter, FolderOpen, AlertCircle
} from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing-client';
import BotanicalGradients from '../components/BotanicalGradients';
import { useTheme } from '../components/ThemeProvider';
import Logo from '../components/Logo';
import {
  cardVariants,
  staggerContainer,
  dropdownVariants,
  overlayVariants,
  modalVariants,
  buttonAnimation,
  cardAnimation,
  transitions,
  easing
} from '@/lib/animations';

interface FileItem {
  _id: string;
  name: string;
  url: string;
  key: string;
  type: string;
  size: number;
  folder: string;
  createdAt: string;
}

export default function FilesPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  // Profile state
  const [profile, setProfile] = useState({
    email: '',
    fullName: '',
    profilePictureUrl: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Files state
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesError, setFilesError] = useState('');
  
  // Filter state
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  // Uploadthing hook
  const { startUpload, isUploading } = useUploadThing('fileUploader', {
    onClientUploadComplete: (res) => {
      if (res) {
        // Refresh files list after upload
        fetchFiles();
        setUploadModalOpen(false);
        setUploadProgress(0);
        setUploadingFiles([]);
      }
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
      setUploadProgress(0);
      setUploadingFiles([]);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setProfile({
          email: data.email || '',
          fullName: data.fullName || '',
          profilePictureUrl: data.profilePictureUrl || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        router.push('/login');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Fetch files
  const fetchFiles = useCallback(async () => {
    try {
      setFilesLoading(true);
      setFilesError('');
      
      const params = new URLSearchParams();
      if (selectedFolder !== 'all') params.append('folder', selectedFolder);
      if (selectedType !== 'all') params.append('type', selectedType);
      
      const res = await fetch(`/api/files?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await res.json();
      setFiles(data.files || []);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      setFilesError(error.message || 'Failed to load files');
    } finally {
      setFilesLoading(false);
    }
  }, [selectedFolder, selectedType]);

  useEffect(() => {
    if (!profileLoading) {
      fetchFiles();
    }
  }, [profileLoading, fetchFiles]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get avatar content
  const getAvatarContent = () => {
    if (profile.fullName) return profile.fullName.charAt(0).toUpperCase();
    if (profile.email) return profile.email.charAt(0).toUpperCase();
    return '?';
  };

  // Handle file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const filesArray = Array.from(selectedFiles);
    setUploadingFiles(filesArray.map(f => f.name));
    setUploadProgress(0);
    await startUpload(filesArray);
    e.target.value = ''; // Reset input
  };

  // Handle drag and drop
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const filesArray = Array.from(droppedFiles);
      setUploadingFiles(filesArray.map(f => f.name));
      setUploadProgress(0);
      await startUpload(filesArray);
    }
  };

  // Delete file
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      setDeleting(fileId);
      const res = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete file');
      
      setFiles(files.filter(f => f._id !== fileId));
      if (previewFile?._id === fileId) setPreviewFile(null);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf' || type.startsWith('text/')) return FileText;
    return File;
  };

  // Get relative time
  const getRelativeTime = (date: string) => {
    const now = new Date();
    const fileDate = new Date(date);
    const diffMs = now.getTime() - fileDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  // Filter files
  const getFilteredFiles = () => {
    let result = files;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(file => 
        file.name.toLowerCase().includes(query)
      );
    }
    
    return result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };
  const filteredFiles = getFilteredFiles();

  // Get unique folders from files
  const getFolders = () => {
    const folderSet = new Set(files.map(f => f.folder));
    return Array.from(folderSet).filter(f => f && f !== 'General');
  };

  // Sidebar content
  const SidebarContent = () => (
    <>
      {/* All Files */}
      <button 
        onClick={() => {
          setSelectedFolder('all');
          setSelectedType('all');
          setSidebarOpen(false);
        }}
        className={`w-full text-left px-4 py-3 rounded-2xl font-sans transition-all duration-500 flex items-center gap-3 ${
          selectedFolder === 'all' && selectedType === 'all'
            ? (isDark ? 'bg-[#242B26] shadow-paper' : 'bg-white shadow-paper') 
            : (isDark ? 'hover:bg-[#242B26]/50' : 'hover:bg-[#DCCFC2]/30')
        }`}
      >
        <Folder className={`w-4 h-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
        <span className={isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}>All Files</span>
      </button>

      <div className={`my-5 h-px ${isDark ? 'bg-[#E6E2DA]/20' : 'bg-[#E6E2DA]/50'}`} />

      {/* Type Filters */}
      <div className="space-y-2">
        <div className="px-4">
          <span className={`text-xs font-sans uppercase tracking-widest ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
            Type
          </span>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => {
              setSelectedType('image');
              setSidebarOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-2xl font-sans transition-all duration-500 flex items-center gap-3 ${
              selectedType === 'image' 
                ? (isDark ? 'bg-[#242B26] shadow-paper' : 'bg-white shadow-paper') 
                : (isDark ? 'hover:bg-[#242B26]/50' : 'hover:bg-[#DCCFC2]/30')
            }`}
          >
            <Image className={`w-4 h-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
            <span className={`text-sm ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>Images</span>
          </button>
          <button
            onClick={() => {
              setSelectedType('document');
              setSidebarOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-2xl font-sans transition-all duration-500 flex items-center gap-3 ${
              selectedType === 'document' 
                ? (isDark ? 'bg-[#242B26] shadow-paper' : 'bg-white shadow-paper') 
                : (isDark ? 'hover:bg-[#242B26]/50' : 'hover:bg-[#DCCFC2]/30')
            }`}
          >
            <FileText className={`w-4 h-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
            <span className={`text-sm ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>Documents</span>
          </button>
        </div>
      </div>

      {getFolders().length > 0 && (
        <>
          <div className={`my-5 h-px ${isDark ? 'bg-[#E6E2DA]/20' : 'bg-[#E6E2DA]/50'}`} />

          {/* Folders Section */}
          <div className="space-y-2">
            <div className="px-4">
              <span className={`text-xs font-sans uppercase tracking-widest ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
                Folders
              </span>
            </div>
            <div className="space-y-1">
              {getFolders().map((folder) => (
                <button
                  key={folder}
                  onClick={() => {
                    setSelectedFolder(folder);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-sans transition-all duration-500 flex items-center gap-3 ${
                    selectedFolder === folder 
                      ? (isDark ? 'bg-[#242B26] shadow-paper' : 'bg-white shadow-paper') 
                      : (isDark ? 'hover:bg-[#242B26]/50' : 'hover:bg-[#DCCFC2]/30')
                  }`}
                >
                  <Folder className={`w-4 h-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
                  <span className={`text-sm truncate ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>{folder}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1A1F1C]' : 'bg-[#F9F8F4]'} relative`}>
      <BotanicalGradients />

      {/* Header */}
      <header className={`sticky top-0 z-50 ${isDark ? 'bg-[#1A1F1C]/80' : 'bg-[#F9F8F4]/80'} backdrop-blur-xl border-b ${isDark ? 'border-[#E6E2DA]/20' : 'border-[#E6E2DA]/50'}`}>
        <div className="w-full h-16 px-4 flex items-center justify-between gap-4">
          {/* Left: Logo + Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full ${isDark ? 'hover:bg-[#242B26]' : 'hover:bg-[#DCCFC2]/50'} transition-all duration-500`}
              aria-label="Toggle sidebar"
            >
              {showSidebar ? <ChevronLeft className="w-4 h-4" strokeWidth={1.5} /> : <ChevronRight className="w-4 h-4" strokeWidth={1.5} />}
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`md:hidden p-2 rounded-full ${isDark ? 'hover:bg-[#242B26]' : 'hover:bg-[#DCCFC2]/50'} transition-colors`}
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button onClick={() => router.push('/notes')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Logo size={32} className={isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'} />
              <span className={`font-serif text-xl ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>Jot</span>
            </button>
            <span className={`text-sm font-sans ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>/ Files</span>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-[400px] hidden sm:block">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-10 py-2.5 rounded-full border font-sans ${isDark ? 'bg-[#242B26]/50 border-[#E6E2DA]/20 text-[#F9F8F4] placeholder-[#8C9A84]/60' : 'bg-white/50 border-[#E6E2DA] text-[#2D3A31] placeholder-[#8C9A84]'} focus:outline-none focus:border-[#8C9A84] transition-all duration-300`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#8C9A84] hover:text-[#F9F8F4]' : 'text-[#8C9A84] hover:text-[#2D3A31]'} transition-colors`}
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={profileLoading}
              className={`w-10 h-10 rounded-full border-2 ${isDark ? 'border-[#E6E2DA]/30' : 'border-[#E6E2DA]'} flex items-center justify-center font-serif text-sm ${isDark ? 'bg-[#242B26] hover:border-[#8C9A84]' : 'bg-white hover:border-[#8C9A84]'} transition-all duration-300 overflow-hidden`}
            >
              {profileLoading ? (
                <span className="text-xs">...</span>
              ) : profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className={isDark ? 'text-[#C27B66]' : 'text-[#C27B66]'}>{getAvatarContent()}</span>
              )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`absolute right-0 mt-2 w-56 ${isDark ? 'bg-[#242B26]' : 'bg-white'} border ${isDark ? 'border-[#E6E2DA]/20' : 'border-[#E6E2DA]'} rounded-2xl shadow-lift overflow-hidden z-[70]`}
                >
                  <div className={`px-4 py-3 text-sm font-sans ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'} truncate`}>
                    {profile.email}
                  </div>
                  <div className={`h-px ${isDark ? 'bg-[#E6E2DA]/20' : 'bg-[#E6E2DA]/50'}`} />
                  
                  <button
                    onClick={() => { setDropdownOpen(false); router.push('/notes'); }}
                    className={`w-full text-left px-4 py-3 text-sm font-sans ${isDark ? 'hover:bg-[#1A1F1C]' : 'hover:bg-[#DCCFC2]/30'} transition-colors ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}
                  >
                    Notes
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); router.push('/profile'); }}
                    className={`w-full text-left px-4 py-3 text-sm font-sans ${isDark ? 'hover:bg-[#1A1F1C]' : 'hover:bg-[#DCCFC2]/30'} transition-colors ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); router.push('/dashboard'); }}
                    className={`w-full text-left px-4 py-3 text-sm font-sans ${isDark ? 'hover:bg-[#1A1F1C]' : 'hover:bg-[#DCCFC2]/30'} transition-colors ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => toggleTheme()}
                    className={`w-full text-left px-4 py-3 text-sm font-sans ${isDark ? 'hover:bg-[#1A1F1C]' : 'hover:bg-[#DCCFC2]/30'} transition-colors flex items-center justify-between ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}
                  >
                    <span>Dark Mode</span>
                    <div className={`w-10 h-5 rounded-full transition-all ${isDark ? 'bg-[#8C9A84]' : 'bg-[#E6E2DA]'} flex items-center`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                  
                  <div className={`h-px ${isDark ? 'bg-[#E6E2DA]/20' : 'bg-[#E6E2DA]/50'}`} />
                  
                  <button
                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    className={`w-full text-left px-4 py-3 text-sm font-sans ${isDark ? 'hover:bg-[#1A1F1C]' : 'hover:bg-[#DCCFC2]/30'} transition-colors text-[#C27B66]`}
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content Wrapper */}
      <div className="flex relative">
        {/* Sidebar Backdrop (Mobile) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <AnimatePresence initial={false}>
          {showSidebar && (
            <motion.aside
              key="desktop-sidebar"
              initial={{ x: -260, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -260, opacity: 0 }}
              transition={{ ...easing.springGentle }}
              className={`hidden md:block md:relative h-[calc(100vh-64px)] w-[260px] ${isDark ? 'bg-[#1A1F1C]' : 'bg-[#DCCFC2]/20'} border-r ${isDark ? 'border-[#E6E2DA]/20' : 'border-[#E6E2DA]/50'} p-4 overflow-y-auto`}
            >
              <SidebarContent />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ ...easing.springGentle }}
              className={`md:hidden fixed top-16 left-0 h-[calc(100vh-64px)] w-[280px] ${isDark ? 'bg-[#1A1F1C]' : 'bg-[#DCCFC2]/30'} backdrop-blur-xl border-r ${isDark ? 'border-[#E6E2DA]/20' : 'border-[#E6E2DA]/50'} p-4 z-50 overflow-y-auto`}
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-full ${isDark ? 'hover:bg-[#242B26]' : 'hover:bg-[#DCCFC2]/50'} transition-colors`}
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
              
              <div className="mt-8">
                <SidebarContent />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 relative z-10 p-4 md:p-6">
          {/* Top Controls */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Mobile Search */}
            <div className="flex sm:hidden items-center gap-3">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-9 py-2.5 rounded-full border font-sans text-sm ${isDark ? 'bg-[#242B26]/50 border-[#E6E2DA]/20 text-[#F9F8F4] placeholder-[#8C9A84]/60' : 'bg-white/50 border-[#E6E2DA] text-[#2D3A31] placeholder-[#8C9A84]'} focus:outline-none focus:border-[#8C9A84] transition-all duration-300`}
                />
              </div>
            </div>

            {/* View Toggle + Upload Button */}
            <div className="flex items-center gap-3 justify-end w-full">
              {/* View Toggle */}
              <div className={`flex items-center gap-1 p-1 rounded-full ${isDark ? 'bg-[#242B26]' : 'bg-[#DCCFC2]/30'}`}>
                <button
                  onClick={() => setViewStyle('grid')}
                  className={`p-2 rounded-full transition-all ${viewStyle === 'grid' ? (isDark ? 'bg-[#8C9A84] text-[#F9F8F4]' : 'bg-white text-[#2D3A31] shadow-paper') : (isDark ? 'text-[#8C9A84] hover:text-[#F9F8F4]' : 'text-[#8C9A84] hover:text-[#2D3A31]')}`}
                >
                  <Grid className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setViewStyle('list')}
                  className={`p-2 rounded-full transition-all ${viewStyle === 'list' ? (isDark ? 'bg-[#8C9A84] text-[#F9F8F4]' : 'bg-white text-[#2D3A31] shadow-paper') : (isDark ? 'text-[#8C9A84] hover:text-[#F9F8F4]' : 'text-[#8C9A84] hover:text-[#2D3A31]')}`}
                >
                  <List className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Upload Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUploadModalOpen(true)}
                className={`px-5 py-2.5 rounded-full font-sans font-medium text-sm shadow-paper transition-all duration-500 flex items-center gap-2 ${isDark ? 'bg-[#8C9A84] text-[#F9F8F4] hover:shadow-lift' : 'bg-[#2D3A31] text-[#F9F8F4] hover:shadow-lift'}`}
              >
                <Upload className="w-4 h-4" strokeWidth={2} />
                <span>Upload</span>
              </motion.button>
            </div>
          </div>

          {/* Loading State */}
          {filesLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className={`${isDark ? 'bg-[#242B26]' : 'bg-white'} rounded-2xl p-4 animate-pulse shadow-paper aspect-square`}
                >
                  <div className={`h-full ${isDark ? 'bg-[#E6E2DA]/20' : 'bg-[#DCCFC2]'} rounded-xl`}></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {filesError && !filesLoading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-[#C27B66]/20' : 'bg-[#C27B66]/10'}`}>
                <AlertCircle className="w-8 h-8 text-[#C27B66]" strokeWidth={1.5} />
              </div>
              <h2 className={`font-serif text-2xl mb-2 ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                {filesError}
              </h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchFiles}
                className={`mt-4 px-6 py-2.5 rounded-full font-sans ${isDark ? 'bg-[#8C9A84] text-[#F9F8F4]' : 'bg-[#2D3A31] text-[#F9F8F4]'}`}
              >
                Try again
              </motion.button>
            </div>
          )}

          {/* Empty State */}
          {!filesLoading && !filesError && filteredFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-[#8C9A84]/20' : 'bg-[#DCCFC2]'}`}>
                <FolderOpen className={`w-8 h-8 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
              </div>
              <h2 className={`font-serif text-2xl mb-2 ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                {searchQuery ? `No files found for '${searchQuery}'` : 'No files yet'}
              </h2>
              <p className={`text-sm font-sans ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'} mb-4`}>
                {searchQuery ? 'Try a different search term' : 'Upload your first file to get started'}
              </p>
              {!searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUploadModalOpen(true)}
                  className={`px-5 py-2.5 rounded-full font-sans flex items-center gap-2 ${isDark ? 'bg-[#8C9A84] text-[#F9F8F4]' : 'bg-[#2D3A31] text-[#F9F8F4]'}`}
                >
                  <Upload className="w-4 h-4" strokeWidth={2} />
                  Upload Files
                </motion.button>
              )}
            </div>
          )}

          {/* Files Grid */}
          {!filesLoading && !filesError && filteredFiles.length > 0 && viewStyle === 'grid' && (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file.type);
                const isImage = file.type.startsWith('image/');
                
                return (
                  <motion.div
                    key={file._id}
                    variants={cardVariants}
                    {...cardAnimation}
                    className={`${isDark ? 'bg-[#242B26]' : 'bg-white'} rounded-2xl overflow-hidden shadow-paper hover:shadow-lift transition-all duration-400 group`}
                  >
                    {/* Preview */}
                    <div 
                      onClick={() => setPreviewFile(file)}
                      className={`aspect-square relative cursor-pointer ${isDark ? 'bg-[#1A1F1C]' : 'bg-[#DCCFC2]/20'}`}
                    >
                      {isImage ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileIcon className={`w-12 h-12 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1} />
                        </div>
                      )}
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
                          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-white" strokeWidth={1.5} />
                        </button>
                        <a 
                          href={file.url} 
                          download={file.name}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        >
                          <Download className="w-4 h-4 text-white" strokeWidth={1.5} />
                        </a>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteFile(file._id); }}
                          disabled={deleting === file._id}
                          className="p-2 bg-white/20 rounded-full hover:bg-red-500/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-white" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-3">
                      <p className={`text-sm font-sans truncate ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                        {file.name}
                      </p>
                      <p className={`text-xs font-sans ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
                        {formatFileSize(file.size)} • {getRelativeTime(file.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Files List */}
          {!filesLoading && !filesError && filteredFiles.length > 0 && viewStyle === 'list' && (
            <div className={`${isDark ? 'bg-[#242B26]' : 'bg-white'} rounded-2xl shadow-paper overflow-hidden`}>
              {filteredFiles.map((file, index) => {
                const FileIcon = getFileIcon(file.type);
                const isImage = file.type.startsWith('image/');
                
                return (
                  <motion.div
                    key={file._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center gap-4 p-4 ${index !== filteredFiles.length - 1 ? (isDark ? 'border-b border-[#E6E2DA]/10' : 'border-b border-[#E6E2DA]/50') : ''} hover:bg-opacity-50 ${isDark ? 'hover:bg-[#1A1F1C]' : 'hover:bg-[#DCCFC2]/20'} transition-colors group`}
                  >
                    {/* Thumbnail */}
                    <div 
                      onClick={() => setPreviewFile(file)}
                      className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer ${isDark ? 'bg-[#1A1F1C]' : 'bg-[#DCCFC2]/20'} flex items-center justify-center`}
                    >
                      {isImage ? (
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <FileIcon className={`w-6 h-6 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-sans truncate ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                        {file.name}
                      </p>
                      <p className={`text-xs font-sans ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
                        {formatFileSize(file.size)} • {getRelativeTime(file.createdAt)}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setPreviewFile(file)}
                        className={`p-2 rounded-full ${isDark ? 'hover:bg-[#242B26]' : 'hover:bg-[#DCCFC2]/50'} transition-colors`}
                      >
                        <Eye className={`w-4 h-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
                      </button>
                      <a 
                        href={file.url} 
                        download={file.name}
                        className={`p-2 rounded-full ${isDark ? 'hover:bg-[#242B26]' : 'hover:bg-[#DCCFC2]/50'} transition-colors`}
                      >
                        <Download className={`w-4 h-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
                      </a>
                      <button 
                        onClick={() => handleDeleteFile(file._id)}
                        disabled={deleting === file._id}
                        className={`p-2 rounded-full hover:bg-red-500/20 transition-colors`}
                      >
                        <Trash2 className="w-4 h-4 text-[#C27B66]" strokeWidth={1.5} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModalOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => !isUploading && setUploadModalOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md ${isDark ? 'bg-[#242B26]' : 'bg-white'} rounded-3xl p-6 shadow-lift`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`font-serif text-xl ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                  Upload Files
                </h2>
                <button
                  onClick={() => !isUploading && setUploadModalOpen(false)}
                  disabled={isUploading}
                  className={`p-2 rounded-full ${isDark ? 'hover:bg-[#1A1F1C]' : 'hover:bg-[#DCCFC2]/30'} transition-colors`}
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragging 
                    ? (isDark ? 'border-[#8C9A84] bg-[#8C9A84]/10' : 'border-[#8C9A84] bg-[#8C9A84]/10') 
                    : (isDark ? 'border-[#E6E2DA]/30 hover:border-[#8C9A84]' : 'border-[#E6E2DA] hover:border-[#8C9A84]')
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.txt,.md"
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center w-full">
                    {/* File names being uploaded */}
                    <div className={`w-full mb-4 max-h-24 overflow-y-auto ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                      {uploadingFiles.map((fileName, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm font-sans mb-1 justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#8C9A84] animate-pulse" />
                          <span className="truncate max-w-[200px]">{fileName}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Progress bar */}
                    <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-[#1A1F1C]' : 'bg-[#E6E2DA]'}`}>
                      <motion.div 
                        className="h-full bg-gradient-to-r from-[#8C9A84] to-[#C27B66] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                    
                    {/* Progress percentage */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="w-5 h-5 border-2 border-[#8C9A84] border-t-transparent rounded-full animate-spin" />
                      <p className={`font-sans text-sm ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
                        {uploadProgress}% uploaded
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1} />
                    <p className={`font-sans mb-2 ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                      Drag & drop files here
                    </p>
                    <p className={`text-sm font-sans ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
                      or click to browse
                    </p>
                    <p className={`text-xs font-sans mt-4 ${isDark ? 'text-[#8C9A84]/60' : 'text-[#8C9A84]/80'}`}>
                      Images (4MB) • PDFs & text files (8MB)
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-4 ${isDark ? 'bg-[#242B26]' : 'bg-white'} rounded-t-2xl`}>
                <div className="flex-1 min-w-0 mr-4">
                  <p className={`font-sans truncate ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                    {previewFile.name}
                  </p>
                  <p className={`text-sm font-sans ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
                    {formatFileSize(previewFile.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className={`p-2 rounded-full ${isDark ? 'hover:bg-[#1A1F1C]' : 'hover:bg-[#DCCFC2]/30'} transition-colors`}
                  >
                    <Download className={`w-5 h-5 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
                  </a>
                  <button
                    onClick={() => handleDeleteFile(previewFile._id)}
                    className={`p-2 rounded-full hover:bg-red-500/20 transition-colors`}
                  >
                    <Trash2 className="w-5 h-5 text-[#C27B66]" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className={`p-2 rounded-full ${isDark ? 'hover:bg-[#1A1F1C]' : 'hover:bg-[#DCCFC2]/30'} transition-colors`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              
              {/* Preview Content */}
              <div className={`flex-1 overflow-auto ${isDark ? 'bg-[#1A1F1C]' : 'bg-[#F9F8F4]'} rounded-b-2xl`}>
                {previewFile.type.startsWith('image/') ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="w-full h-auto"
                  />
                ) : previewFile.type === 'application/pdf' ? (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-[70vh]"
                    title={previewFile.name}
                  />
                ) : (
                  <div className="p-8 text-center">
                    <FileText className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1} />
                    <p className={`font-sans ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                      Preview not available
                    </p>
                    <a
                      href={previewFile.url}
                      download={previewFile.name}
                      className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full font-sans text-sm ${isDark ? 'bg-[#8C9A84] text-[#F9F8F4]' : 'bg-[#2D3A31] text-[#F9F8F4]'}`}
                    >
                      <Download className="w-4 h-4" strokeWidth={1.5} />
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
