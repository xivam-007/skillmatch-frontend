'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, User, Share2, Target, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { SkillPicker } from '@/components/forms/SkillPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LookingForType } from '@/types';

const LOOKING_FOR_OPTIONS: { value: LookingForType; label: string }[] = [
  { value: 'peer_coding', label: 'Peer Coding' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'project_building', label: 'Project Building' },
];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [githubUsername, setGithubUsername] = useState(user?.githubUsername ?? '');
  const [leetcodeHandle, setLeetcodeHandle] = useState(user?.leetcodeHandle ?? '');
  const [skillsKnown, setSkillsKnown] = useState<string[]>(user?.skillsKnown ?? []);
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>(user?.skillsToLearn ?? []);
  const [lookingFor, setLookingFor] = useState<LookingForType[]>(user?.lookingFor ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await userApi.updateProfile({
        name,
        bio,
        githubUsername: githubUsername || undefined,
        leetcodeHandle: leetcodeHandle || undefined,
        skillsKnown,
        skillsToLearn,
        lookingFor,
      });
      setUser(res.data.data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleLookingFor = (val: LookingForType) =>
    setLookingFor((prev) =>
      prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]
    );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-800"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 transition-transform group-hover:-translate-x-0.5 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                Edit Profile
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your public identity and skills on Skill Sanchay
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Section: Basic Identity */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <User className="h-4 w-4 text-indigo-500" />
                <h2>Personal Information</h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <Input
                label="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="max-w-md"
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Tell other developers about your journey..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-400"
                />
                <div className="mt-2 flex justify-end">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${bio.length > 450 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                    {bio.length} / 500
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Social Presence */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <Share2 className="h-4 w-4 text-indigo-500" />
                <h2>Developer Profiles</h2>
              </div>
            </div>
            <div className="grid gap-5 p-6 md:grid-cols-2">
              <Input
                label="GitHub Username"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="username"
              />
              <Input
                label="LeetCode Handle"
                value={leetcodeHandle}
                onChange={(e) => setLeetcodeHandle(e.target.value)}
                placeholder="username"
              />
            </div>
          </section>

          {/* Section: Goals */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <Target className="h-4 w-4 text-indigo-500" />
                <h2>Looking For</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-3">
                {LOOKING_FOR_OPTIONS.map(({ value, label }) => {
                  const isActive = lookingFor.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleLookingFor(value)}
                      className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
                        isActive
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600 dark:border-indigo-400 dark:bg-indigo-900/20 dark:text-indigo-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isActive && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section: Skills */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <Award className="h-4 w-4 text-emerald-500" />
                <h3>Expertise</h3>
              </div>
              <SkillPicker
                value={skillsKnown}
                onChange={setSkillsKnown}
                variant="known"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                <Target className="h-4 w-4 text-blue-500" />
                <h3>Learning Path</h3>
              </div>
              <SkillPicker
                value={skillsToLearn}
                onChange={setSkillsToLearn}
                variant="learn"
              />
            </div>
          </div>

          {/* Floating Actions / Feedback */}
          <div className="sticky bottom-6 mt-4 flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 animate-in fade-in slide-in-from-bottom-2 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 animate-in fade-in slide-in-from-bottom-2 dark:bg-emerald-900/20 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Changes saved successfully!
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="h-14 w-full rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-[0.98] dark:shadow-none"
              isLoading={saving}
              leftIcon={!saving && <Save className="h-5 w-5" />}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}