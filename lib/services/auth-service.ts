import axios, { AxiosInstance } from "axios";
import { BASE_API_URL } from "../utils/constants";
import { RefreshResponse } from "@/types/clientResponseTypes";
import {
  API_AUTH_LOGIN_ENDPOINT,
  API_AUTH_REFRESH_ENDPOINT,
} from "../utils/constants";

export class AuthService {
  private baseURL: string = BASE_API_URL || "/api";
  private refreshClient: AxiosInstance;

  constructor() {
    // Separate axios instance for refresh (no interceptors)
    this.refreshClient = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
  }

  /**
   * Refresh access token using refresh token from cookie
   */
  public async refreshToken(): Promise<RefreshResponse> {
    try {
      const response = await this.refreshClient.post<RefreshResponse>(
        API_AUTH_REFRESH_ENDPOINT,
        {}
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to refresh token";
      throw new Error(errorMessage);
    }
  }

  /**
   * Check if an endpoint is an auth endpoint
   */
  public isAuthEndpoint(url: string | undefined): boolean {
    if (!url) return false;
    return (
      url.includes(API_AUTH_LOGIN_ENDPOINT) ||
      url.includes(API_AUTH_REFRESH_ENDPOINT)
    );
  }
}

// Export singleton
export const authService = new AuthService();
export default AuthService;
