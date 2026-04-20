'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Code2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { userApi, integrationApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { SkillPicker } from '@/components/forms/SkillPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LookingForType } from '@/types';

const LOOKING_FOR_OPTIONS: { value: LookingForType; label: string; emoji: string; desc: string }[] = [
  { value: 'peer_coding', label: 'Peer Coding', emoji: '💻', desc: 'LeetCode, side projects, pair programming' },
  { value: 'mentorship', label: 'Mentorship', emoji: '🎓', desc: 'Learn from or guide another developer' },
  { value: 'project_building', label: 'Project Building', emoji: '🚀', desc: 'Build something together from scratch' },
];

const STEPS = ['Skills I Know', 'Skills to Learn', 'My Goals', 'GitHub & LeetCode', 'Ready!'];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [step, setStep] = useState(0);
  const [skillsKnown, setSkillsKnown] = useState<string[]>(user?.skillsKnown ?? []);
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>(user?.skillsToLearn ?? []);
  const [lookingFor, setLookingFor] = useState<LookingForType[]>(user?.lookingFor ?? []);
  const [bio, setBio] = useState(user?.bio ?? '');
  const [githubUsername, setGithubUsername] = useState(user?.githubUsername ?? '');
  const [leetcodeHandle, setLeetcodeHandle] = useState(user?.leetcodeHandle ?? '');
  const [githubSnapshot, setGithubSnapshot] = useState<any>(null);
  const [fetchingGithub, setFetchingGithub] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const progress = ((step + 1) / STEPS.length) * 100;

  const fetchGithub = async () => {
    if (!githubUsername.trim()) return;
    setFetchingGithub(true);
    try {
      const res = await integrationApi.github(githubUsername.trim());
      setGithubSnapshot(res.data.data);
    } catch {
      setError('GitHub user not found. Double-check the username.');
    } finally {
      setFetchingGithub(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await userApi.updateProfile({
        skillsKnown,
        skillsToLearn,
        lookingFor,
        bio,
        githubUsername: githubUsername || undefined,
        leetcodeHandle: leetcodeHandle || undefined,
        availability: false,
      });
      setUser(res.data.data.user);
      router.push('/discover');
    } catch {
      setError('Failed to save profile. Please try again.');
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return skillsKnown.length > 0;
    if (step === 1) return skillsToLearn.length > 0;
    if (step === 2) return lookingFor.length > 0;
    return true;
  };

  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] px-4 py-12">
      <div className="mx-auto w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--text)]">Set up your profile</h1>
          <p className="mt-2 text-[var(--text-muted)]">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <motion.div
            className="h-full rounded-full bg-brand-500"
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeInOut', duration: 0.4 }}
          />
        </div>

        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  i < step
                    ? 'bg-brand-500 text-white'
                    : i === step
                    ? 'border-2 border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-2 border-[var(--border)] text-[var(--text-muted)]'
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="hidden text-[10px] text-[var(--text-muted)] sm:block">{s}</span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="card min-h-80 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {/* Step 0: Skills Known */}
              {step === 0 && (
                <SkillPicker
                  label="Which technologies do you know well?"
                  value={skillsKnown}
                  onChange={setSkillsKnown}
                  variant="known"
                />
              )}

              {/* Step 1: Skills to Learn */}
              {step === 1 && (
                <SkillPicker
                  label="What do you want to learn?"
                  value={skillsToLearn}
                  onChange={setSkillsToLearn}
                  variant="learn"
                />
              )}

              {/* Step 2: Looking For */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-[var(--text)]">
                    What kind of collaboration are you looking for?
                  </p>
                  <div className="space-y-3">
                    {LOOKING_FOR_OPTIONS.map(({ value, label, emoji, desc }) => {
                      const selected = lookingFor.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setLookingFor((prev) =>
                              selected ? prev.filter((t) => t !== value) : [...prev, value]
                            )
                          }
                          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                            selected
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                              : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                          }`}
                        >
                          <span className="text-2xl">{emoji}</span>
                          <div className="flex-1">
                            <p className="font-medium text-[var(--text)]">{label}</p>
                            <p className="text-xs text-[var(--text-muted)]">{desc}</p>
                          </div>
                          {selected && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                      Short bio <span className="text-[var(--text-muted)]">(optional)</span>
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Full-stack dev exploring ML. Open to mentorship and building cool things."
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                    <p className="mt-1 text-right text-xs text-[var(--text-muted)]">{bio.length}/500</p>
                  </div>
                </div>
              )}

              {/* Step 3: Integrations */}
              {step === 3 && (
                <div className="space-y-6">
                  <p className="text-sm text-[var(--text-muted)]">
                    Connect your accounts to show a technical snapshot on your card.
                    Both are optional.
                  </p>

                  {/* GitHub */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        label="GitHub username"
                        placeholder="torvalds"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        leftIcon={<Github className="h-4 w-4" />}
                        className="flex-1"
                      />
                      <div className="flex items-end">
                        <Button
                          variant="secondary"
                          onClick={fetchGithub}
                          isLoading={fetchingGithub}
                          disabled={!githubUsername.trim()}
                        >
                          Verify
                        </Button>
                      </div>
                    </div>

                    {githubSnapshot && (
                      <div className="rounded-xl border border-green-300 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                        <div className="flex items-center gap-2">
                          <img
                            src={githubSnapshot.avatarUrl}
                            alt={githubSnapshot.login}
                            className="h-8 w-8 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">
                              ✓ @{githubSnapshot.login}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-500">
                              {githubSnapshot.publicRepos} repos · {githubSnapshot.stars} stars ·{' '}
                              {githubSnapshot.topLanguages.slice(0, 3).join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* LeetCode */}
                  <Input
                    label="LeetCode handle"
                    placeholder="neal_wu"
                    value={leetcodeHandle}
                    onChange={(e) => setLeetcodeHandle(e.target.value)}
                    leftIcon={<Code2 className="h-4 w-4" />}
                  />
                </div>
              )}

              {/* Step 4: Summary */}
              {step === 4 && (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-purple-500 text-4xl font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text)]">{user?.name}</h2>

                  <div className="rounded-xl bg-[var(--bg-secondary)] p-4 text-left space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        I know
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {skillsKnown.slice(0, 5).map((s) => (
                          <span key={s} className="skill-pill-known">{s}</span>
                        ))}
                        {skillsKnown.length > 5 && (
                          <span className="skill-pill bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                            +{skillsKnown.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Want to learn
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {skillsToLearn.slice(0, 5).map((s) => (
                          <span key={s} className="skill-pill-learn">{s}</span>
                        ))}
                        {skillsToLearn.length > 5 && (
                          <span className="skill-pill bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                            +{skillsToLearn.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Looking for
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {lookingFor.map((t) => (
                          <span key={t} className="skill-pill bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                            {t.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleSave} isLoading={saving} rightIcon={<Check className="h-4 w-4" />}>
              Start matching!
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
