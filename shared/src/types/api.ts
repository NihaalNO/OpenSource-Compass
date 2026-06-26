export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface CurrentUserResponse {
  user: {
    id: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    onboardingCompleted: boolean;
    github: {
      username: string | null;
      connected: boolean;
      lastSyncedAt: string | null;
    };
  };
}

export interface SessionResponse {
  valid: boolean;
  expiresAt: string | null;
}

export interface LogoutResponse {
  success: boolean;
}
