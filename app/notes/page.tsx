'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, FileText, Search, Plus, ArrowLeft, Trash2, X, Menu, ChevronLeft, ChevronRight, Folder, AlertCircle, NotebookPen } from 'lucide-react';
import BotanicalGradients from '../components/BotanicalGradients';
import { useTheme } from '../components/ThemeProvider';
import { 
  cardVariants, 
  staggerContainer, 
  dropdownVariants, 
  sidebarVariants,
  modalVariants,
  overlayVariants,
  buttonAnimation,
  cardAnimation,
  tagVariants,
  transitions,
  easing
} from '@/lib/animations';

export default function NotesPage() {
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
  
  // Notes state
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState('');
  const [selectedNote, setSelectedNote] = useState<any>(null);
  
  // Folders state
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  
  // Tags state
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Editor state
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [editingNote, setEditingNote] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState('Saved');
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingNote, setCreatingNote] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setNotesLoading(true);
        setNotesError('');
        const res = await fetch('/api/notes');
        if (!res.ok) {
          throw new Error('Failed to fetch notes');
        }
        const data = await res.json();
        setNotes(data.notes || []);
      } catch (error: any) {
        console.error('Error fetching notes:', error);
        setNotesError(error.message || 'Failed to load notes');
      } finally {
        setNotesLoading(false);
      }
    };

    if (!profileLoading) {
      fetchNotes();
    }
  }, [profileLoading]);

  // Fetch folders
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch('/api/folders');
        if (!res.ok) {
          throw new Error('Failed to fetch folders');
        }
        const data = await res.json();
        setFolders(data.folders || []);
      } catch (error: any) {
        console.error('Error fetching folders:', error);
      }
    };

    if (!profileLoading) {
      fetchFolders();
    }
  }, [profileLoading]);

  // Auto-save editor changes
  useEffect(() => {
    if (!editingNote || viewMode !== 'editor') return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('Saving...');

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/notes/${editingNote._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editingNote.title,
            content: editingNote.content,
            folder: editingNote.folder,
            tags: editingNote.tags || [],
            isPinned: editingNote.isPinned || false,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to save');
        }

        setSaveStatus('Saved ✓');
        setNotes(notes.map(n => n._id === editingNote._id ? editingNote : n));
      } catch (error) {
        console.error('Error saving note:', error);
        setSaveStatus('Failed to save');
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editingNote, viewMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Create new note
  const handleCreateNote = async () => {
    try {
      setCreatingNote(true);
      const folderForNewNote = selectedFolder === 'all' ? 'General' : selectedFolder;
      
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: '',
          folder: folderForNewNote,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create note');
      }

      const data = await res.json();
      setNotes([data.note, ...notes]);
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setCreatingNote(false);
    }
  };

  // Handle note click
  const handleNoteClick = (note: any) => {
    setSelectedNote(note);
    setEditingNote(note);
    setViewMode('editor');
  };

  // Create new folder
  const handleCreateFolder = async () => {
    const name = prompt('Folder name:');
    if (!name || name.trim() === '') return;

    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          color: '#8C9A84',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create folder');
      }

      const data = await res.json();
      setFolders([...folders, data.folder]);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  // Get tag color (botanical palette)
  const getTagColor = (tagName: string) => {
    const colors = ['#C27B66', '#8C9A84', '#DCCFC2', '#4A5D4E', '#E6E2DA', '#2D3A31'];
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = ((hash << 5) - hash) + tagName.charCodeAt(i);
      hash = hash & hash;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Get folder color (botanical palette - subtle muted tones)
  const getFolderColor = (folderName: string) => {
    const colors = [
      '#8C9A84', // sage
      '#C27B66', // terracotta  
      '#4A5D4E', // forest
      '#DCCFC2', // clay
      '#9BA593', // muted sage
      '#B08D7A', // muted terracotta
    ];
    let hash = 0;
    for (let i = 0; i < folderName.length; i++) {
      hash = ((hash << 5) - hash) + folderName.charCodeAt(i);
      hash = hash & hash;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Get all unique tags from notes with counts
  const getAllTags = () => {
    const tagMap = new Map<string, number>();
    notes.forEach(note => {
      note.tags?.forEach((tag: string) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Filter notes
  const getFilteredNotes = () => {
    let result = selectedFolder === 'all' 
      ? notes 
      : notes.filter(note => note.folder === selectedFolder);
    
    if (selectedTag) {
      result = result.filter(note => note.tags?.includes(selectedTag));
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    }
    
    return result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  };
  const filteredNotes = getFilteredNotes();

  // Handle delete note
  const handleDeleteNote = async () => {
    if (!editingNote) return;

    try {
      setDeleting(true);
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      const noteId = editingNote._id;
      
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete note');
      }

      setEditingNote(null);
      setNotes(notes.filter(n => n._id !== noteId));
      setViewMode('list');
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Get relative time
  const getRelativeTime = (date: string) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffMs = now.getTime() - noteDate.getTime();
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

  // Retry fetching notes
  const retryFetch = () => {
    setNotesLoading(true);
    setNotesError('');
    fetch('/api/notes')
      .then(res => res.json())
      .then(data => setNotes(data.notes || []))
      .catch(err => setNotesError(err.message))
      .finally(() => setNotesLoading(false));
  };

  // Sidebar content component (reused for desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* All Notes */}
      <button 
        onClick={() => {
          setSelectedFolder('all');
          setSelectedTag(null);
          setSidebarOpen(false);
        }}
        className={`w-full text-left px-4 py-3 rounded-2xl font-sans transition-all duration-500 flex items-center gap-3 ${
          selectedFolder === 'all' 
            ? (isDark ? 'bg-[#242B26] shadow-paper' : 'bg-white shadow-paper') 
            : (isDark ? 'hover:bg-[#242B26]/50' : 'hover:bg-[#DCCFC2]/30')
        }`}
      >
        <FileText className={`w-4 h-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
        <span className={isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}>All Notes</span>
      </button>

      {/* All Files - Link to Files Page */}
      <button 
        onClick={() => {
          router.push('/files');
        }}
        className={`w-full text-left px-4 py-3 rounded-2xl font-sans transition-all duration-500 flex items-center gap-3 ${isDark ? 'hover:bg-[#242B26]/50' : 'hover:bg-[#DCCFC2]/30'}`}
      >
        <Folder className={`w-4 h-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
        <span className={isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}>All Files</span>
      </button>

      <div className={`my-5 h-px ${isDark ? 'bg-[#E6E2DA]/20' : 'bg-[#E6E2DA]/50'}`} />

      {/* Folders Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-4">
          <span className={`text-xs font-sans uppercase tracking-widest ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
            Folders
          </span>
          <button
            onClick={handleCreateFolder}
            className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'hover:bg-[#242B26]' : 'hover:bg-[#DCCFC2]/50'} transition-colors`}
            title="New Folder"
          >
            <Plus className={`w-3 h-3 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={2} />
          </button>
        </div>
        {folders.length === 0 ? (
          <div className={`px-4 py-3 text-sm font-sans ${isDark ? 'text-[#8C9A84]/60' : 'text-[#8C9A84]'}`}>
            No folders yet
          </div>
        ) : (
          <div className="space-y-1">
            {folders.map((folder) => (
              <button
                key={folder._id}
                onClick={() => {
                  setSelectedFolder(folder.name);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-2xl font-sans transition-all duration-500 flex items-center gap-3 ${
                  selectedFolder === folder.name 
                    ? (isDark ? 'bg-[#242B26] shadow-paper' : 'bg-white shadow-paper') 
                    : (isDark ? 'hover:bg-[#242B26]/50' : 'hover:bg-[#DCCFC2]/30')
                }`}
              >
                <div 
                  className={`w-3 h-3 rounded-full ${isDark ? 'opacity-80' : 'opacity-70'}`}
                  style={{ backgroundColor: getFolderColor(folder.name) }}
                />
                <span className={`text-sm truncate ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>{folder.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`my-5 h-px ${isDark ? 'bg-[#E6E2DA]/20' : 'bg-[#E6E2DA]/50'}`} />

      {/* Tags Section */}
      <div className="space-y-2">
        <div className="px-4">
          <span className={`text-xs font-sans uppercase tracking-widest ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
            Tags
          </span>
        </div>
        {getAllTags().length === 0 ? (
          <div className={`px-4 py-3 text-sm font-sans ${isDark ? 'text-[#8C9A84]/60' : 'text-[#8C9A84]'}`}>
            No tags yet
          </div>
        ) : (
          <div className="space-y-1">
            {getAllTags().map((tag) => (
              <button
                key={tag.name}
                onClick={() => {
                  setSelectedTag(selectedTag === tag.name ? null : tag.name);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-2xl font-sans transition-all duration-500 flex items-center justify-between ${
                  selectedTag === tag.name 
                    ? (isDark ? 'bg-[#242B26] shadow-paper' : 'bg-white shadow-paper') 
                    : (isDark ? 'hover:bg-[#242B26]/50' : 'hover:bg-[#DCCFC2]/30')
                }`}
              >
                <span className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTagColor(tag.name) }} />
                  <span className={`truncate ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>{tag.name}</span>
                </span>
                <span className={`text-xs ${isDark ? 'text-[#8C9A84]/60' : 'text-[#8C9A84]'}`}>
                  {tag.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1A1F1C]' : 'bg-[#F9F8F4]'} relative`}>
      <BotanicalGradients />

      {/* Header - Hidden in editor mode */}
      {viewMode === 'list' && (
        <header className={`sticky top-0 z-50 ${isDark ? 'bg-[#1A1F1C]/80' : 'bg-[#F9F8F4]/80'} backdrop-blur-xl border-b ${isDark ? 'border-[#E6E2DA]/20' : 'border-[#E6E2DA]/50'}`}>
        <div className="w-full h-16 px-4 flex items-center justify-between gap-4">
          {/* Left: Logo + Hamburger */}
          <div className="flex items-center gap-3">
            {/* Desktop sidebar toggle */}
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
            <h1 className={`font-serif text-2xl ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>Jot</h1>
          </div>

          {/* Center: Search */}
          {viewMode === 'list' && (
            <div className="flex-1 max-w-[400px] hidden sm:block">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search notes..."
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
          )}

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
                  {/* User Email */}
                  <div className={`px-4 py-3 text-sm font-sans ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'} truncate`}>
                    {profile.email}
                  </div>
                  <div className={`h-px ${isDark ? 'bg-[#E6E2DA]/20' : 'bg-[#E6E2DA]/50'}`} />
                  
                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push('/profile');
                    }}
                    className={`w-full text-left px-4 py-3 text-sm font-sans ${isDark ? 'hover:bg-[#1A1F1C]' : 'hover:bg-[#DCCFC2]/30'} transition-colors ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push('/dashboard');
                    }}
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
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
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
      )}

      {/* Main Content Wrapper */}
      <div className="flex relative">
        {/* Sidebar Backdrop (Mobile) - Only in list mode */}
        {viewMode === 'list' && (
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
        )}

        {/* Desktop Sidebar - Only in list mode */}
        {viewMode === 'list' && (
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
        )}

        {/* Mobile Sidebar - Only in list mode */}
        {viewMode === 'list' && (
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
                {/* Close button */}
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
        )}

        {/* Main Content Area */}
        <main className="flex-1 relative z-10">
          {viewMode === 'list' ? (
            <div className="p-4 md:p-6">
              {/* Top Controls */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Mobile: Search + Create in one row */}
                <div className="flex sm:hidden items-center gap-3">
                  <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-9 py-2.5 rounded-full border font-sans text-sm ${isDark ? 'bg-[#242B26]/50 border-[#E6E2DA]/20 text-[#F9F8F4] placeholder-[#8C9A84]/60' : 'bg-white/50 border-[#E6E2DA] text-[#2D3A31] placeholder-[#8C9A84]'} focus:outline-none focus:border-[#8C9A84] transition-all duration-300`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#8C9A84] hover:text-[#F9F8F4]' : 'text-[#8C9A84] hover:text-[#2D3A31]'} transition-colors`}
                      >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateNote}
                    disabled={creatingNote}
                    className={`px-4 py-2.5 rounded-full font-sans font-medium text-sm whitespace-nowrap shadow-paper transition-all duration-500 flex items-center gap-2 disabled:opacity-50 ${isDark ? 'bg-[#8C9A84] text-[#F9F8F4] hover:shadow-lift' : 'bg-[#2D3A31] text-[#F9F8F4] hover:shadow-lift'}`}
                  >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                    <span className="hidden xs:inline">New</span>
                  </motion.button>
                </div>

                {/* Desktop: New Note Button */}
                <div className="hidden sm:flex justify-end w-full">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateNote}
                    disabled={creatingNote}
                    className={`px-5 py-2.5 rounded-full font-sans font-medium text-sm shadow-paper transition-all duration-500 flex items-center gap-2 disabled:opacity-50 ${isDark ? 'bg-[#8C9A84] text-[#F9F8F4] hover:shadow-lift' : 'bg-[#2D3A31] text-[#F9F8F4] hover:shadow-lift'}`}
                  >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                    <span>{creatingNote ? 'Creating...' : 'New Note'}</span>
                  </motion.button>
                </div>
              </div>

              {/* Loading State */}
              {notesLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`${isDark ? 'bg-[#242B26]' : 'bg-white'} rounded-3xl p-6 animate-pulse shadow-paper`}
                    >
                      <div className={`h-6 ${isDark ? 'bg-[#E6E2DA]/20' : 'bg-[#DCCFC2]'} rounded-full mb-4 w-3/4`}></div>
                      <div className={`h-4 ${isDark ? 'bg-[#E6E2DA]/20' : 'bg-[#DCCFC2]'} rounded-full mb-2 w-full`}></div>
                      <div className={`h-4 ${isDark ? 'bg-[#E6E2DA]/20' : 'bg-[#DCCFC2]'} rounded-full mb-4 w-5/6`}></div>
                      <div className={`h-3 ${isDark ? 'bg-[#E6E2DA]/20' : 'bg-[#DCCFC2]'} rounded-full w-1/4`}></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {notesError && !notesLoading && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-[#C27B66]/20' : 'bg-[#C27B66]/10'}`}>
                    <AlertCircle className="w-8 h-8 text-[#C27B66]" strokeWidth={1.5} />
                  </div>
                  <h2 className={`font-serif text-2xl mb-2 ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                    {notesError}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={retryFetch}
                    className={`mt-4 px-6 py-2.5 rounded-full font-sans ${isDark ? 'bg-[#8C9A84] text-[#F9F8F4]' : 'bg-[#2D3A31] text-[#F9F8F4]'}`}
                  >
                    Try again
                  </motion.button>
                </div>
              )}

              {/* Empty State */}
              {!notesLoading && !notesError && filteredNotes.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-[#8C9A84]/20' : 'bg-[#DCCFC2]'}`}>
                    <NotebookPen className={`w-8 h-8 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`} strokeWidth={1.5} />
                  </div>
                  <h2 className={`font-serif text-2xl mb-2 ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                    {searchQuery ? `No notes found for '${searchQuery}'` : (selectedFolder === 'all' ? 'No notes yet' : `No notes in ${selectedFolder}`)}
                  </h2>
                  <p className={`text-sm font-sans ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'} mb-4`}>
                    {searchQuery ? 'Try a different search term' : (selectedFolder === 'all' ? 'Create your first note to get started' : 'Create a note in this folder')}
                  </p>
                  {searchQuery && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSearchQuery('')}
                      className={`px-5 py-2.5 rounded-full font-sans border ${isDark ? 'border-[#8C9A84] text-[#8C9A84] hover:bg-[#8C9A84] hover:text-[#F9F8F4]' : 'border-[#2D3A31] text-[#2D3A31] hover:bg-[#2D3A31] hover:text-[#F9F8F4]'} transition-all duration-300`}
                    >
                      Clear Search
                    </motion.button>
                  )}
                </div>
              )}

              {/* Notes Grid - Staggered Masonry */}
              {!notesLoading && !notesError && filteredNotes.length > 0 && (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {filteredNotes.map((note, index) => (
                    <motion.div
                      key={note._id}
                      variants={cardVariants}
                      {...cardAnimation}
                      onClick={() => handleNoteClick(note)}
                      className={`${isDark ? 'bg-[#242B26]' : 'bg-white'} rounded-3xl p-6 cursor-pointer shadow-paper hover:shadow-lift transition-shadow duration-500 relative ${note.isPinned ? (isDark ? 'ring-1 ring-[#C27B66]/30' : 'ring-1 ring-[#C27B66]/20') : ''}`}
                    >
                      {/* Folder Badge */}
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-sans lowercase tracking-wide ${isDark ? 'bg-[#DCCFC2]/20 text-[#8C9A84]' : 'bg-[#DCCFC2] text-[#8C9A84]'}`}>
                        {note.folder}
                      </div>

                      {/* Pin indicator */}
                      {note.isPinned && (
                        <div className="absolute top-4 left-4">
                          <Pin className="w-4 h-4 text-[#C27B66]" strokeWidth={1.5} fill="currentColor" />
                        </div>
                      )}

                      {/* Title */}
                      <h3 className={`font-serif text-xl mb-3 pr-20 ${note.isPinned ? 'pl-6' : ''} ${isDark ? 'text-[#F9F8F4]' : 'text-[#2D3A31]'}`}>
                        {note.title}
                      </h3>

                      {/* Content Preview */}
                      <p className={`text-sm font-sans mb-4 line-clamp-2 ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
                        {note.content.substring(0, 100) || 'No content'}
                        {note.content.length > 100 && '...'}
                      </p>

                      {/* Tags */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {note.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="px-2.5 py-1 rounded-full text-xs font-sans"
                              style={{ 
                                backgroundColor: `${getTagColor(tag)}20`,
                                color: getTagColor(tag)
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-sans ${isDark ? 'bg-[#E6E2DA]/20 text-[#8C9A84]' : 'bg-[#DCCFC2] text-[#8C9A84]'}`}>
                              +{note.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className={`text-xs font-sans uppercase tracking-widest ${isDark ? 'text-[#E6E2DA]/60' : 'text-[#E6E2DA]'}`}>
                        {getRelativeTime(note.updatedAt)}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          ) : (
            // EDITOR VIEW
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transitions.enter}
              className={`px-4 md:px-6 pt-3 pb-4 h-screen flex flex-col ${isDark ? 'bg-[#1A1F1C]' : 'bg-[#F9F8F4]'}`}
            >
              {/* Editor Toolbar */}
              <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isDark ? 'border-[#E6E2DA]/20' : 'border-[#E6E2DA]/50'}`}>
                <button
                  onClick={() => {
                    setViewMode('list');
                    setEditingNote(null);
                    setSelectedNote(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-sans flex items-center gap-1.5 ${isDark ? 'hover:bg-[#242B26]' : 'hover:bg-[#DCCFC2]/30'} transition-all duration-300`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Back</span>
                </button>

                <div className={`flex items-center gap-1.5 text-xs font-sans ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
                  <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{saveStatus}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingNote({ ...editingNote, isPinned: !editingNote?.isPinned })}
                    className={`p-1.5 rounded-full transition-all duration-300 ${editingNote?.isPinned ? (isDark ? 'bg-terracotta/20 text-[#C27B66]' : 'bg-terracotta/10 text-[#C27B66]') : (isDark ? 'hover:bg-[#242B26] text-[#8C9A84]' : 'hover:bg-[#DCCFC2]/30 text-[#8C9A84]')}`}
                    title={editingNote?.isPinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin className="w-3.5 h-3.5" strokeWidth={1.5} fill={editingNote?.isPinned ? 'currentColor' : 'none'} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteNote}
                    disabled={deleting}
                    className="px-3 py-1.5 rounded-full text-xs font-sans bg-terracotta text-white hover:bg-terracotta/90 transition-all duration-300 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span className="hidden sm:inline">{deleting ? 'Removing...' : 'Delete'}</span>
                  </motion.button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 flex flex-col gap-5 overflow-hidden max-w-3xl mx-auto w-full">
                {/* Folder Selector */}
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-sans ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
                    Path:
                  </span>
                  <select
                    value={editingNote?.folder || 'General'}
                    onChange={(e) => setEditingNote({ ...editingNote, folder: e.target.value })}
                    className={`px-4 py-2 rounded-full font-sans text-sm ${isDark ? 'bg-[#242B26] text-[#F9F8F4] border-[#E6E2DA]/20' : 'bg-[#DCCFC2]/30 text-[#2D3A31] border-[#E6E2DA]'} border outline-none cursor-pointer transition-colors`}
                  >
                    <option value="General">General</option>
                    {folders.map((folder) => (
                      <option key={folder._id} value={folder.name}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags Input */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className={`text-sm font-sans ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'}`}>
                      Tags:
                    </span>
                    <input
                      type="text"
                      placeholder="Add tags (comma-separated)..."
                      onBlur={(e) => {
                        const input = e.target.value.trim();
                        if (input) {
                          const newTags = input.split(',').map(t => t.trim()).filter(t => t);
                          const existingTags = editingNote?.tags || [];
                          const combinedTags = Array.from(new Set([...existingTags, ...newTags]));
                          setEditingNote({ ...editingNote, tags: combinedTags });
                          e.target.value = '';
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = (e.target as HTMLInputElement).value.trim();
                          if (input) {
                            const newTags = input.split(',').map(t => t.trim()).filter(t => t);
                            const existingTags = editingNote?.tags || [];
                            const combinedTags = Array.from(new Set([...existingTags, ...newTags]));
                            setEditingNote({ ...editingNote, tags: combinedTags });
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      className={`flex-1 px-4 py-2 rounded-full font-sans text-sm ${isDark ? 'bg-[#242B26] text-[#F9F8F4] placeholder-[#8C9A84]/60 border-[#E6E2DA]/20' : 'bg-[#DCCFC2]/30 text-[#2D3A31] placeholder-[#8C9A84] border-[#E6E2DA]'} border outline-none transition-colors`}
                    />
                  </div>
                  
                  {/* Tags Pills */}
                  {editingNote?.tags && editingNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editingNote.tags.map((tag: string, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans"
                          style={{ 
                            backgroundColor: `${getTagColor(tag)}20`,
                            color: getTagColor(tag)
                          }}
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => {
                              setEditingNote({
                                ...editingNote,
                                tags: editingNote.tags.filter((_: string, i: number) => i !== idx),
                              });
                            }}
                            className="hover:opacity-70 transition-opacity"
                          >
                            <X className="w-3 h-3" strokeWidth={2} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title Input */}
                <input
                  type="text"
                  value={editingNote?.title || ''}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className={`text-4xl font-serif outline-none bg-transparent ${isDark ? 'text-[#F9F8F4] placeholder-stone/50' : 'text-[#2D3A31] placeholder-stone'}`}
                  placeholder="Note title..."
                />

                {/* Content Textarea */}
                <textarea
                  value={editingNote?.content || ''}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className={`flex-1 outline-none bg-transparent text-lg font-sans leading-relaxed resize-none ${isDark ? 'text-[#8C9A84]' : 'text-[#8C9A84]'} placeholder-[#8C9A84]/40`}
                  placeholder="Start writing..."
                />
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
