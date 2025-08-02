import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, UserType } from './useAuthStore.types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoggedIn: false,
      setAccessToken: (token) => set({ accessToken: token, isLoggedIn: !!token }),
      setRefreshToken: (token: string) => set({ refreshToken: token }),
      clearAuthStore: () =>
        set({ accessToken: null, refreshToken: null, user: null, isLoggedIn: false }),
      setUser: (user: UserType) => set({ user: user }),
      setUserNickname: (newNickname: string) =>
        set((state) => ({
          user: state.user ? { ...state.user, nickname: newNickname } : null,
        })),
      setUserProfileImage: (newUrl: string) =>
        set((state) => ({
          user: state.user ? { ...state.user, profileImageUrl: newUrl } : null,
        })),
      setUserProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    { name: 'auth-storage' },
  ),
);
