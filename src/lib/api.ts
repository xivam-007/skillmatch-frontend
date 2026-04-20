import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/** Singleton Axios instance pre-configured for the SkillMatch API */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT from localStorage ─────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sm_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 → redirect to login ─────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('sm_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// ─── Typed API helpers ────────────────────────────────────────────────────────

import type {
  User,
  DiscoveryCandidate,
  Message,
  GithubSnapshot,
  LeetcodeSnapshot,
  LookingForType,
} from '@/types';

export const authApi = {
  register: (name: string, email: string, password: string) =>
    apiClient.post<{ success: boolean; data: { token: string; user: User } }>(
      '/auth/register',
      { name, email, password }
    ),
  login: (email: string, password: string) =>
    apiClient.post<{ success: boolean; data: { token: string; user: User } }>(
      '/auth/login',
      { email, password }
    ),
  me: () =>
    apiClient.get<{ success: boolean; data: { user: User } }>('/auth/me'),
};

export const userApi = {
  getProfile: () =>
    apiClient.get<{ success: boolean; data: { user: User } }>('/users/me'),
  updateProfile: (data: Partial<User>) =>
    apiClient.put<{ success: boolean; data: { user: User } }>('/users/me', data),
  getById: (id: string) =>
    apiClient.get<{ success: boolean; data: { user: User } }>(`/users/${id}`),
};

export const discoverApi = {
  getStack: (params: { page?: number; limit?: number; filter?: LookingForType }) =>
    apiClient.get<{
      success: boolean;
      data: { candidates: DiscoveryCandidate[]; page: number; limit: number };
    }>('/discover', { params }),
};

export const matchApi = {
  swipe: (targetId: string, direction: 'left' | 'right') =>
    apiClient.post<{ success: boolean; data: { matched: boolean; matchedUserId?: string } }>(
      '/swipe',
      { targetId, direction }
    ),
  getMatches: () =>
    apiClient.get<{ success: boolean; data: { matches: User[] } }>('/matches'),
};

export const chatApi = {
  getHistory: (matchId: string, page = 1) =>
    apiClient.get<{ success: boolean; data: { messages: Message[] } }>(
      `/messages/${matchId}`,
      { params: { page } }
    ),
  send: (matchId: string, content: string) =>
    apiClient.post<{ success: boolean; data: { message: Message } }>('/messages', {
      matchId,
      content,
    }),
};

export const integrationApi = {
  github: (username: string) =>
    apiClient.get<{ success: boolean; data: GithubSnapshot }>(
      `/integrations/github/${username}`
    ),
  leetcode: (handle: string) =>
    apiClient.get<{ success: boolean; data: LeetcodeSnapshot }>(
      `/integrations/leetcode/${handle}`
    ),
};
