export interface UserType {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface userResponseType {
  user: UserType | null;
  refreshToken: string;
  accessToken: string;
}

export interface userRequestType {
  email: string;
  password: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserType | null;
  isLoggedIn: boolean;
  _hasHydrated: boolean; // ✅ hydration 여부
  setHasHydrated: (state: boolean) => void; // ✅ hydration 상태 업데이트 함수
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  clearAuthStore: () => void;
  setUser: (user: UserType) => void;
  setUserProfileImage: (newUrl: string) => void;
  setUserProfile: (updates: Partial<Pick<UserType, 'email' | 'nickname'>>) => void;
}
