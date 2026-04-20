'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form.email, form.password);
      const { token, user } = res.data.data;
      setAuth(token, user);
      // New users without skills go to onboarding
      const needsOnboarding =
        user.skillsKnown.length === 0 && user.skillsToLearn.length === 0;
      router.push(needsOnboarding ? '/onboarding' : '/discover');
    } catch (err: any) {
      setError(
        err.response?.data?.error ?? 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Welcome back</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Sign in to continue discovering collaborators
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          leftIcon={<Mail className="h-4 w-4" />}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          leftIcon={<Lock className="h-4 w-4" />}
          required
          autoComplete="current-password"
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" isLoading={loading}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--text-muted)]">
        Don't have an account?{' '}
        <Link
          href="/auth/register"
          className="font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
