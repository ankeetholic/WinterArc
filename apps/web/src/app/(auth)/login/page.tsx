'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Snowflake, ArrowRight, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06090e] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Aurora Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-arc-500/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-sky-600/10 rounded-full blur-[96px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-arc-400 to-sky-600 p-0.5 shadow-xl shadow-arc-500/20 mb-2">
            <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center text-arc-400">
              <Snowflake className="w-7 h-7" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Winter Arc</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Decide what matters. Execute every day. Build your consistency streak.
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 border-slate-800/80 shadow-2xl shadow-black/80 bg-[#0c121d]/90 backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" className="w-full mt-2" loading={loading} size="lg">
              Sign In to Arc <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="text-arc-400 hover:text-arc-300 font-bold underline underline-offset-4">
              Begin Your Arc
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
