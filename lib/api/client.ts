import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { BASE_API_URL } from "../utils/constants";
import { authService } from "../services/auth-service";

export class LotteryAPIClient {
  private baseURL: string = BASE_API_URL || "/api";
  private token: string | null = null;
  private axiosInstance: AxiosInstance;

  constructor(baseURL?: string) {
    if (baseURL) {
      this.baseURL = baseURL;
    }
    this.loadToken();

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // For passing the cookie
    });

    // Request interceptor - adds token to headers
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        if (config.data instanceof FormData) {
          delete config.headers["Content-Type"];
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handles errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
          _skipRefresh?: boolean;
        };
        const status = error.response?.status;
        const url = originalRequest.url;
        if (authService.isAuthEndpoint(url)) {
          return Promise.reject(error);
        }
        if (status === 401) {
          if (originalRequest._skipRefresh) {
            return Promise.reject(error);
          }
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            originalRequest._skipRefresh = true;
            try {
              const refreshResponse = await authService.refreshToken();
              this.setToken(refreshResponse.accessToken);
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${refreshResponse.accessToken}`,
              };
              return this.axiosInstance(originalRequest);
            } catch (refreshError) {
              console.error("Refresh token error:", refreshError);
              this.setToken(null);
              if (typeof window !== "undefined") {
                localStorage.removeItem("user");
                window.location.href = "/login";
              }
              return Promise.reject(refreshError);
            }
          }
        }

        // Extract error message
        const errorMessage =
          (error.response?.data as any)?.error ||
          (error.response?.data as any)?.message ||
          error.message ||
          "Request failed";

        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  /**
   * Load access token from localStorage
   */
  private loadToken(): void {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("accessToken");
    }
  }

  /**
   * Set access token
   */
  public setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("accessToken", token);
      } else {
        localStorage.removeItem("accessToken");
      }
    }
  }

  /**
   * Get current access token
   */
  public getToken(): string | null {
    return this.token;
  }

  // ==================== Basic HTTP Methods ====================

  /**
   * GET request
   * @param endpoint - API endpoint
   * @param config - Optional axios config
   * @returns Response data
   */
  public async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param config - Optional axios config
   * @returns Response data
   */
  public async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param config - Optional axios config
   * @returns Response data
   */
  public async put<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param config - Optional axios config
   * @returns Response data
   */
  public async patch<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(
        endpoint,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @param config - Optional axios config
   * @returns Response data
   */
  public async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new LotteryAPIClient();
