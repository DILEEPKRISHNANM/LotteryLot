//endpoints for the api
export const BASE_API_URL = "/api";
export const API_BASE_URL = process.env.INDIA_LOTTERY_API_URL!;

// External Lottery API endpoints (used in lottery-api.ts)
export const API_LOTTERY_LATEST_ENDPOINT = "/latest";
export const API_LOTTERY_DATE_ENDPOINT = (date: string) =>
  `by-date?date=${date}`;
export const API_LOTTERY_HISTORY_ENDPOINT = (limit: number, offset: number) =>
  `history?limit=${limit}&offset=${offset}`;

// Internal API endpoints (used in components - goes through Next.js API routes)
export const API_LOTTERY_LATEST_ENDPOINT_INTERNAL = "/lottery/latest";
export const API_LOTTERY_DATE_ENDPOINT_INTERNAL = (date: string) =>
  `/lottery/date?date=${date}`;
export const API_LOTTERY_HISTORY_ENDPOINT_INTERNAL = (
  limit: number,
  offset: number
) => `/lottery/history?limit=${limit}&offset=${offset}`;

// Auth endpoints
export const API_AUTH_REFRESH_ENDPOINT = "/refresh";
export const API_AUTH_LOGIN_ENDPOINT = "/auth/login";
export const API_AUTH_ME_ENDPOINT = "/me";

// Admin endpoints
export const API_ADMIN_USERS_ENDPOINT = "/admin/users";

