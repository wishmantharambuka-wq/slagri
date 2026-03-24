// Navbar - Main navigation component with auth state
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { APP_NAME, TOKEN_KEY, USER_KEY } from '@/lib/constants/config';
import { User } from '@/lib/types/auth';
// Using FontAwesome via CDN

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    // Check auth state
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }

    // Check backend health
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/health`)
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    window.location.href = '/';
  };

  const statusColors = {
    connected: 'bg-green-500',
    disconnected: 'bg-red-500',
    checking: 'bg-yellow-500',
  };

  return (
    <nav className="sticky top-0 z-50 px-6 py-3 bg-white/65 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="max-w-full mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white shadow-lg transform group-hover:rotate-12 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l-9-4 9-4 9 4-9 4z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V9m0 0l-4 2m4-2l4 2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-gray-900 leading-none">
              {APP_NAME.split('').slice(0, -2).join('')}
              <span className="text-orange-500">{APP_NAME.slice(-2)}</span>
            </span>
            <span className="text-[9px] text-gray-500 font-bold tracking-wider uppercase">National Intelligence</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex bg-gray-100/50 p-1 rounded-full backdrop-blur-md border border-white/50">
          <Link href="/" className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:bg-white hover:text-orange-500 transition">
            Dashboard
          </Link>
          <Link href="/map" className="px-4 py-1.5 rounded-full text-xs font-bold bg-white text-orange-600 shadow-sm">
            Map & Intelligence
          </Link>
          <Link href="/marketplace" className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:bg-white hover:text-orange-500 transition">
            Marketplace
          </Link>
          <Link href="/farmer" className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:bg-white hover:text-orange-500 transition">
            Farmer Zone
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Backend Status */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusColors[backendStatus]}`} />
            <span className="text-[10px] font-bold text-gray-500" data-backend-status="">
              {backendStatus === 'connected' ? 'Live' : backendStatus === 'disconnected' ? 'Offline' : 'Checking...'}
            </span>
          </div>

          {/* Alerts Bell */}
          <button className="relative w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition">
            <i className="fas fa-bell w-4 h-4" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 border-2 border-white rounded-full animate-pulse" />
          </button>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-wide hover:bg-orange-100 transition border border-orange-200"
              >
                <i className="fas fa-user w-4 h-4" />
                {user.name}
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-100 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                  >
                    <i className="fas fa-sign-out-alt w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-white/80 text-blue-600 text-xs font-bold uppercase tracking-wide hover:bg-white hover:shadow-md transition border border-blue-100"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
