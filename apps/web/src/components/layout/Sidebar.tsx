'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckCircle2,
  Target,
  Dumbbell,
  Flame,
  LineChart,
  Settings,
  LogOut,
  Snowflake,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Today Focus', href: '/today', icon: CheckCircle2 },
  { name: 'Workout Routine', href: '/workout', icon: Dumbbell },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Arc Timeline', href: '/arc', icon: Flame },
  { name: 'Progress & Analytics', href: '/progress', icon: LineChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userInitials = (user?.first_name ? user.first_name[0] : (user?.email ? user.email[0] : 'U')).toUpperCase();

  return (
    <aside className="w-64 bg-[#070b12]/95 border-r border-slate-800/80 backdrop-blur-2xl flex flex-col justify-between hidden md:flex min-h-screen sticky top-0 z-30 shadow-2xl shadow-black/50">
      <div>
        {/* Brand */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800/80">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arc-400 to-sky-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-arc-500/25">
              <Snowflake className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-white tracking-widest uppercase">Winter Arc</h1>
              <span className="w-1.5 h-1.5 rounded-full bg-arc-400" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight">Consistency Platform</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
            Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-arc-500/20 to-sky-500/5 text-arc-300 font-bold border border-arc-500/30 shadow-md shadow-arc-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-arc-400 rounded-r-full shadow-md shadow-arc-400" />
                )}
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-arc-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-[#06090e]/60 space-y-3">
        {user && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 text-arc-300 font-bold text-xs flex items-center justify-center border border-slate-700">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.full_name || user.email.split('@')[0]}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
