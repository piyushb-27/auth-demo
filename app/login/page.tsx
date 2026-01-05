'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neutral-700 transition-colors"
                placeholder="Email"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neutral-700 transition-colors"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm px-1">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center text-sm pt-2">
            <span className="text-gray-400">Don't have an account? </span>
            <Link href="/signup" className="text-white hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
