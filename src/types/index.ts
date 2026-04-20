// ─── User ─────────────────────────────────────────────────────────────────────
export type LookingForType = 'peer_coding' | 'mentorship' | 'project_building';

export interface User {
  _id: string;
  uid: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  githubUsername?: string;
  leetcodeHandle?: string;
  codeforcesHandle?: string;
  skillsKnown: string[];
  skillsToLearn: string[];
  availability: boolean;
  lookingFor: LookingForType[];
  matches: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Discovery ────────────────────────────────────────────────────────────────
export interface DiscoveryCandidate {
  user: User;
  matchScore: number;
  sharedSkills: string[];
  complementarySkills: string[];
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export interface Message {
  _id: string;
  matchId: string;
  senderId: User | string;
  content: string;
  read: boolean;
  createdAt: string;
}

// ─── Integrations ─────────────────────────────────────────────────────────────
export interface GithubSnapshot {
  login: string;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  stars: number;
  topLanguages: string[];
  pinnedRepos: Array<{
    name: string;
    description: string | null;
    language: string | null;
    stargazerCount: number;
    url: string;
  }>;
}

export interface LeetcodeSnapshot {
  username: string;
  ranking: number | null;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  contestRating: number | null;
  badges: string[];
}

// ─── API responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
