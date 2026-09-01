'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Shield, Moon, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your account profile and application preferences.</p>
      </div>

      {/* Profile Info */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-arc-500/10 border border-arc-500/20 text-arc-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Account Profile</h2>
            <p className="text-xs text-slate-400">Your personal details and identity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 font-medium">Email Address</span>
            <p className="text-sm font-semibold text-white mt-1">{user?.email}</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 font-medium">Full Name</span>
            <p className="text-sm font-semibold text-white mt-1">
              {user?.full_name || 'Not provided'}
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 sm:col-span-2">
            <span className="text-slate-500 font-medium">Member Since</span>
            <p className="text-sm font-semibold text-white mt-1">
              {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Active Member'}
            </p>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Appearance</h2>
            <p className="text-xs text-slate-400">Theme is optimized for focused dark discipline mode</p>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Winter Arc uses the high-contrast Dark Mode design system inspired by developer tools and GitHub heatmaps.
        </p>
      </Card>

      {/* Security & Logout */}
      <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-red-500/20">
        <div>
          <h3 className="text-sm font-bold text-white">Sign Out of Account</h3>
          <p className="text-xs text-slate-400 mt-0.5">End your current session on this browser.</p>
        </div>
        <Button variant="danger" size="sm" onClick={logout}>
          <LogOut className="w-4 h-4 mr-1.5" /> Log Out
        </Button>
      </Card>
    </div>
  );
}
