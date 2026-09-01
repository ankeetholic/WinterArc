'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Snowflake,
  LayoutDashboard,
  CheckCircle2,
  Dumbbell,
  Target,
  Flame,
  LineChart,
  Settings,
  LogOut,
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

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="md:hidden sticky top-0 z-40 bg-[#070b12]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 h-16 flex items-center justify-between shadow-lg shadow-black/40">
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-arc-400 to-sky-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-arc-500/20">
          <Snowflake className="w-4 h-4" />
        </div>
        <div>
          <span className="text-sm font-extrabold text-white tracking-widest uppercase">Winter Arc</span>
        </div>
      </Link>

      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bg-[#070b12] border-b border-slate-800 p-4 space-y-1.5 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-arc-500/15 text-arc-300 font-bold border border-arc-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 truncate max-w-[200px]">{user?.email}</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="text-xs text-rose-400 flex items-center gap-1.5 font-semibold px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
