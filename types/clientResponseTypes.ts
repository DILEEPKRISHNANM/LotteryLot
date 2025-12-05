export interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: {
    username: string;
    role: 'admin' | 'client';
  };
}

export interface RefreshResponse {
  success: boolean;
  accessToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  result?: T;
  error?: string;
  message?: string;
}
