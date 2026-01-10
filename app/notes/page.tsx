'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import FloatingGradients from '../components/FloatingGradients';
import { useTheme } from '../components/ThemeProvider';

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

  // Styling
  const bg = isDark ? 'bg-black text-white' : 'bg-white text-gray-900';
  const cardBg = isDark
    ? 'bg-neutral-900/60 border-neutral-800'
    : 'bg-white/60 border-gray-200';
  const inputStyles = isDark
    ? 'bg-neutral-900 border-neutral-800 text-white placeholder-gray-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';
  const buttonStyles = isDark
    ? 'bg-white text-black hover:bg-gray-100'
    : 'bg-black text-white hover:bg-gray-900';
  const hoverBg = isDark ? 'hover:bg-neutral-800' : 'hover:bg-gray-100';
  const dividerColor = isDark ? 'border-neutral-800' : 'border-gray-200';

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

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('Saving...');

    // Debounce save by 1 second
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

        // Update the note in the list
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

  // Keyboard shortcuts (Escape clears when focused)
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
    console.log('Selected note:', note);
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
          color: '#3b82f6',
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

  // Get folder color
  const getFolderColor = (folderName: string) => {
    const folder = folders.find(f => f.name === folderName);
    return folder?.color || '#3b82f6';
  };

  // Get tag color (hash-based consistent coloring)
  const getTagColor = (tagName: string) => {
    const colors = ['#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#f97316', '#6366f1'];
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = ((hash << 5) - hash) + tagName.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
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

  // Card animation variants
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 240, damping: 22 },
    },
  };

  // Filter notes by folder, tag, and search
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
    
    // Sort: pinned first, then by updatedAt (most recent)
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
      
      // Cancel any pending auto-save
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

      // Only clear after successful delete
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

  return (
    <div className={`min-h-screen ${bg} relative`}>
      <FloatingGradients />

      {/* Header */}
      <header className={`sticky top-0 z-50 ${cardBg} backdrop-blur border-b ${dividerColor} md:h-[64px]`}>
        <div className="w-full h-full px-4 py-3 md:py-0 flex items-center justify-between gap-4">
          {/* Left: Logo + Hamburger */}
          <div className="flex items-center gap-3">
            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`hidden md:inline-flex items-center justify-center w-9 h-9 rounded-lg ${hoverBg} transition-colors`}
              aria-label="Toggle sidebar"
            >
              {showSidebar ? '⟨⟩' : '☰'}
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`md:hidden text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <h1 className="text-2xl font-bold">Jot</h1>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-[400px] hidden sm:block">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-2 pr-10 rounded-lg border ${inputStyles} focus:outline-none focus:ring-2 focus:ring-offset-0 ${isDark ? 'focus:ring-neutral-700' : 'focus:ring-gray-400'} transition-all`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={profileLoading}
              className={`w-10 h-10 rounded-full border-2 ${isDark ? 'border-neutral-700' : 'border-gray-300'} flex items-center justify-center font-semibold text-sm ${hoverBg} transition-all overflow-hidden`}
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
                getAvatarContent()
              )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute right-0 mt-2 w-56 ${isDark ? 'bg-neutral-900' : 'bg-white'} border ${isDark ? 'border-neutral-700' : 'border-gray-300'} rounded-xl shadow-2xl overflow-hidden z-[70]`}
                >
                  {/* User Email */}
                  <div className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                    {profile.email}
                  </div>
                  <div className={`border-t ${dividerColor}`} />
                  
                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push('/profile');
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${hoverBg} transition-colors`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push('/dashboard');
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${hoverBg} transition-colors`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      toggleTheme();
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${hoverBg} transition-colors flex items-center justify-between`}
                  >
                    <span>Dark Mode</span>
                    <div className={`w-10 h-5 rounded-full transition-all ${isDark ? 'bg-blue-600' : 'bg-gray-400'} flex items-center`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                  
                  <div className={`border-t ${dividerColor}`} />
                  
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${hoverBg} transition-colors text-red-500`}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Left Sidebar */}
        {/* Desktop: Animated slide in/out; Mobile: Slide in when open */}
        <AnimatePresence initial={false}>
          {showSidebar && (
            <motion.div
              key="desktop-sidebar"
              initial={{ x: -260, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -260, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className={`hidden md:block md:relative top-[60px] left-0 h-[calc(100vh-60px)] w-[250px] ${cardBg} backdrop-blur-2xl backdrop-saturate-150 ${isDark ? 'border-neutral-800' : 'border-gray-200'} border-r p-4 overflow-y-auto`}
            >
          {/* All Notes */}
          <button 
            onClick={() => {
              setSelectedFolder('all');
              setSelectedTag(null);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg ${selectedFolder === 'all' ? (isDark ? 'bg-neutral-800' : 'bg-gray-200') : ''} ${hoverBg} transition-colors flex items-center gap-2`}
          >
            <span>📄</span>
            <span>All Notes</span>
          </button>

          <div className={`my-4 border-t ${dividerColor}`} />

          {/* Folders Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Folders
              </span>
              <button
                onClick={handleCreateFolder}
                className={`text-lg ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
                title="New Folder"
              >
                +
              </button>
            </div>
            {folders.length === 0 ? (
              <div className={`px-3 py-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                No folders yet
              </div>
            ) : (
              <div className="space-y-1">
                {folders.map((folder) => (
                  <button
                    key={folder._id}
                    onClick={() => setSelectedFolder(folder.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg ${selectedFolder === folder.name ? (isDark ? 'bg-neutral-800' : 'bg-gray-200') : ''} ${hoverBg} transition-colors flex items-center gap-2`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="text-sm truncate">{folder.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`my-4 border-t ${dividerColor}`} />

          {/* Tags Section */}
          <div className="space-y-2">
            <div className="px-3">
              <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tags
              </span>
            </div>
            {getAllTags().length === 0 ? (
              <div className={`px-3 py-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                No tags yet
              </div>
            ) : (
              <div className="space-y-1">
                {getAllTags().map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg ${selectedTag === tag.name ? (isDark ? 'bg-neutral-800' : 'bg-gray-200') : ''} ${hoverBg} transition-colors flex items-center justify-between`}
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTagColor(tag.name) }} />
                      <span className="truncate">{tag.name}</span>
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      {tag.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar - Animated */}
        <AnimatePresence initial={false}>
          {showSidebar && (
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -250, opacity: 0 }}
              animate={{ x: sidebarOpen ? 0 : -250, opacity: 1 }}
              exit={{ x: -250, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`md:hidden fixed top-[60px] left-0 h-[calc(100vh-60px)] w-[250px] ${cardBg} backdrop-blur-2xl backdrop-saturate-150 ${isDark ? 'border-neutral-800' : 'border-gray-200'} border-r p-4 z-40 overflow-y-auto`}
            >
          {/* Close button (Mobile only) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className={`md:hidden absolute top-4 right-4 text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}
            aria-label="Close sidebar"
          >
            ✕
          </button>

          {/* All Notes */}
          <button 
            onClick={() => {
              setSelectedFolder('all');
              setSelectedTag(null);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg ${selectedFolder === 'all' ? (isDark ? 'bg-neutral-800' : 'bg-gray-200') : ''} ${hoverBg} transition-colors flex items-center gap-2`}
          >
            <span>📄</span>
            <span>All Notes</span>
          </button>

          <div className={`my-4 border-t ${dividerColor}`} />

          {/* Folders Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Folders
              </span>
              <button
                onClick={handleCreateFolder}
                className={`text-lg ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
                title="New Folder"
              >
                +
              </button>
            </div>
            {folders.length === 0 ? (
              <div className={`px-3 py-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                No folders yet
              </div>
            ) : (
              <div className="space-y-1">
                {folders.map((folder) => (
                  <button
                    key={folder._id}
                    onClick={() => setSelectedFolder(folder.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg ${selectedFolder === folder.name ? (isDark ? 'bg-neutral-800' : 'bg-gray-200') : ''} ${hoverBg} transition-colors flex items-center gap-2`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="text-sm truncate">{folder.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`my-4 border-t ${dividerColor}`} />

          {/* Tags Section */}
          <div className="space-y-2">
            <div className="px-3">
              <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tags
              </span>
            </div>
            {getAllTags().length === 0 ? (
              <div className={`px-3 py-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                No tags yet
              </div>
            ) : (
              <div className="space-y-1">
                {getAllTags().map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${selectedTag === tag.name ? (isDark ? 'bg-neutral-800' : 'bg-gray-200') : ''} ${hoverBg} transition-colors`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTagColor(tag.name) }} />
                      <span className="text-sm truncate">{tag.name}</span>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {tag.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 relative z-10 md:ml-0 ml-0">
          {viewMode === 'list' ? (
            <div className="p-4">
              {/* Top Controls */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Mobile: Search + Create in one row */}
                <div className="flex sm:hidden items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full px-3 py-2 pr-9 rounded-lg border ${inputStyles} focus:outline-none focus:ring-2 focus:ring-offset-0 ${isDark ? 'focus:ring-neutral-700' : 'focus:ring-gray-400'} transition-all`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 text-base ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                        aria-label="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateNote}
                    disabled={creatingNote}
                    className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${buttonStyles} shadow-md transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="text-lg">+</span>
                    <span className="hidden xs:inline">New</span>
                  </motion.button>
                </div>

                {/* Desktop/New Note Button */}
                <div className="hidden sm:flex justify-end w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateNote}
                    disabled={creatingNote}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${buttonStyles} shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ml-auto`}
                  >
                    <span className="text-xl">+</span>
                    <span>{creatingNote ? 'Creating...' : 'New Note'}</span>
                  </motion.button>
                </div>
              </div>

              {/* Loading State */}
              {notesLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`${cardBg} backdrop-blur border ${dividerColor} rounded-xl p-6 animate-pulse`}
                    >
                      <div className={`h-6 ${isDark ? 'bg-neutral-800' : 'bg-gray-300'} rounded mb-4 w-3/4`}></div>
                      <div className={`h-4 ${isDark ? 'bg-neutral-800' : 'bg-gray-300'} rounded mb-2 w-full`}></div>
                      <div className={`h-4 ${isDark ? 'bg-neutral-800' : 'bg-gray-300'} rounded mb-4 w-5/6`}></div>
                      <div className={`h-3 ${isDark ? 'bg-neutral-800' : 'bg-gray-300'} rounded w-1/4`}></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {notesError && !notesLoading && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {notesError}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={retryFetch}
                    className={`mt-4 px-6 py-2 rounded-lg ${buttonStyles}`}
                  >
                    Retry
                  </motion.button>
                </div>
              )}

              {/* Empty State */}
              {!notesLoading && !notesError && filteredNotes.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {searchQuery ? `No notes found for '${searchQuery}'` : (selectedFolder === 'all' ? 'No notes yet' : `No notes in ${selectedFolder}`)}
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {searchQuery ? 'Try a different search term' : (selectedFolder === 'all' ? 'Create your first note to get started' : 'Create a note in this folder')}
                  </p>
                  {searchQuery && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSearchQuery('')}
                      className={`px-4 py-2 rounded-lg ${buttonStyles} transition-all`}
                    >
                      Clear Search
                    </motion.button>
                  )}
                </div>
              )}

              {/* Notes Grid */}
              {!notesLoading && !notesError && filteredNotes.length > 0 && (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  initial="hidden"
                  animate="show"
                  transition={{ staggerChildren: 0.05 }}
                >
                  {filteredNotes.map((note) => (
                    <motion.div
                      key={note._id}
                      variants={cardVariants}
                      whileHover={{ y: -4, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleNoteClick(note)}
                      className={`${cardBg} backdrop-blur border shadow-sm hover:shadow-md ${
                        selectedNote?._id === note._id
                          ? isDark
                            ? 'border-white'
                            : 'border-black'
                          : note.isPinned
                          ? isDark ? 'border-yellow-600' : 'border-yellow-400'
                          : dividerColor
                      } rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-xl relative transform-gpu ${note.isPinned ? (isDark ? 'bg-yellow-950/20' : 'bg-yellow-50/20') : ''}`}
                    >
                      {/* Folder Badge */}
                      <div
                        className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium`}
                        style={{
                          backgroundColor: isDark ? `${getFolderColor(note.folder)}33` : `${getFolderColor(note.folder)}22`,
                          color: getFolderColor(note.folder),
                        }}
                      >
                        {note.folder}
                      </div>

                      {/* Pin indicator */}
                      {note.isPinned && (
                        <div className="absolute top-3 left-3 text-lg text-yellow-400 drop-shadow-sm">📌</div>
                      )}

                      {/* Title */}
                      <h3 className={`text-xl font-bold mb-3 truncate pr-20 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {note.title}
                      </h3>

                      {/* Content Preview */}
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3 line-clamp-2`}>
                        {note.content.substring(0, 100) || 'No content'}
                        {note.content.length > 100 && '...'}
                      </p>
                      {/* Tags */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {note.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: getTagColor(tag) }}>
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-neutral-700 text-gray-300' : 'bg-gray-300 text-gray-700'}`}>
                              +{note.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {getRelativeTime(note.updatedAt)}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          ) : (
            // EDITOR VIEW
            <div className="p-4 h-[calc(100vh-60px)] flex flex-col">
              {/* Editor Toolbar */}
              <div className={`flex items-center justify-between mb-4 pb-3 border-b ${dividerColor}`}>
                <button
                  onClick={() => {
                    setViewMode('list');
                    setEditingNote(null);
                    setSelectedNote(null);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm ${hoverBg} transition-colors flex items-center gap-2`}
                >
                  ← Back
                </button>

                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {saveStatus}
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingNote({ ...editingNote, isPinned: !editingNote?.isPinned })}
                    className={`px-3 py-2 rounded-lg text-lg transition-colors ${editingNote?.isPinned ? (isDark ? 'bg-yellow-600/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600') : (isDark ? 'hover:bg-neutral-800' : 'hover:bg-gray-100')}`}
                    title={editingNote?.isPinned ? 'Unpin note' : 'Pin note'}
                  >
                    {editingNote?.isPinned ? '📌' : '📍'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteNote}
                    disabled={deleting}
                    className="px-3 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </motion.button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Folder Selector */}
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Folder:
                  </span>
                  <select
                    value={editingNote?.folder || 'General'}
                    onChange={(e) => setEditingNote({ ...editingNote, folder: e.target.value })}
                    className={`px-3 py-1 rounded-lg ${isDark ? 'bg-neutral-800 text-white' : 'bg-gray-100 text-gray-900'} outline-none cursor-pointer`}
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
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
                      className={`w-full sm:flex-1 min-w-[200px] px-3 py-2 rounded-lg ${isDark ? 'bg-neutral-800 text-white' : 'bg-gray-100 text-gray-900'} outline-none text-sm`}
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
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getTagColor(tag) }}
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => {
                              setEditingNote({
                                ...editingNote,
                                tags: editingNote.tags.filter((_: string, i: number) => i !== idx),
                              });
                            }}
                            className="hover:opacity-70 transition-opacity ml-1"
                          >
                            ✕
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
                  className={`text-4xl font-bold outline-none bg-transparent ${isDark ? 'text-white' : 'text-gray-900'}`}
                  placeholder="Note title..."
                />

                {/* Content Textarea */}
                <textarea
                  value={editingNote?.content || ''}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className={`flex-1 outline-none bg-transparent text-lg resize-none ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  placeholder="Start typing..."
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
