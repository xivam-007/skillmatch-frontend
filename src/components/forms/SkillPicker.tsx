'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { clsx } from 'clsx';

const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#',
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte',
  'Node.js', 'Express', 'FastAPI', 'Django', 'Spring Boot',
  'PostgreSQL', 'MongoDB', 'Redis', 'MySQL',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'GraphQL', 'REST APIs', 'gRPC',
  'Machine Learning', 'PyTorch', 'TensorFlow',
  'LeetCode / DSA', 'System Design',
  'Git', 'CI/CD', 'Linux',
];

interface SkillPickerProps {
  label: string;
  value: string[];
  onChange: (skills: string[]) => void;
  variant?: 'known' | 'learn';
  maxSkills?: number;
}

export function SkillPicker({
  label,
  value,
  onChange,
  variant = 'known',
  maxSkills = 20,
}: SkillPickerProps) {
  const [customInput, setCustomInput] = useState('');

  const toggle = (skill: string) => {
    if (value.includes(skill)) {
      onChange(value.filter((s) => s !== skill));
    } else if (value.length < maxSkills) {
      onChange([...value, skill]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxSkills) {
      onChange([...value, trimmed]);
      setCustomInput('');
    }
  };

  const pillBase =
    variant === 'known'
      ? 'bg-brand-100 text-brand-700 border-brand-300 dark:bg-brand-900/40 dark:text-brand-300 dark:border-brand-700'
      : 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700';

  const selectedBase =
    variant === 'known'
      ? 'bg-brand-500 text-white border-brand-500'
      : 'bg-amber-500 text-white border-amber-500';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--text)]">{label}</p>
        <span className="text-xs text-[var(--text-muted)]">
          {value.length}/{maxSkills} selected
        </span>
      </div>

      {/* Selected skills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
          {value.map((skill) => (
            <span
              key={skill}
              className={clsx(
                'flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                pillBase
              )}
            >
              {skill}
              <button
                type="button"
                onClick={() => onChange(value.filter((s) => s !== skill))}
                className="ml-0.5 opacity-70 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Preset skill grid */}
      <div className="flex flex-wrap gap-1.5">
        {POPULAR_SKILLS.map((skill) => {
          const selected = value.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggle(skill)}
              className={clsx(
                'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                selected ? selectedBase : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              {skill}
            </button>
          );
        })}
      </div>

      {/* Custom skill input */}
      <div className="flex gap-2">
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder="Add a custom skill…"
          className="h-9 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customInput.trim() || value.length >= maxSkills}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
