export interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: {
    username: string;
    role: "admin" | "client";
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

export interface UserProfile {
  success: boolean;
  user: {
    userId: string;
    username: string;
    role: "admin" | "client";
  };
}

export interface clientRegisterForm  {
  username : string;
  email : string;
  password : string;
}
