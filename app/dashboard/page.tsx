'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-white font-semibold">Dashboard</div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-white tracking-tight">
            Hello World
          </h1>
          <p className="text-gray-400 text-lg">
            Welcome to your dashboard
          </p>
        </div>

        {/* Optional: Add some cards or content */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
            <h3 className="text-white font-medium mb-2">Getting Started</h3>
            <p className="text-gray-400 text-sm">Welcome to your new dashboard. Start building something amazing.</p>
          </div>
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
            <h3 className="text-white font-medium mb-2">Your Profile</h3>
            <p className="text-gray-400 text-sm">Manage your account settings and preferences here.</p>
          </div>
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
            <h3 className="text-white font-medium mb-2">Resources</h3>
            <p className="text-gray-400 text-sm">Access documentation and helpful guides to get the most out of your account.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
