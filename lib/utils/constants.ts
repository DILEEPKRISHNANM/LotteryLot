//endpoints for the api
export const BASE_API_URL = "/api";
export const API_BASE_URL = process.env.INDIA_LOTTERY_API_URL!;
export const API_LOTTERY_LATEST_ENDPOINT = "/latest";
export const API_LOTTERY_DATE_ENDPOINT = (date: string) =>
  `by-date?date=${date}`;
export const API_LOTTERY_HISTORY_ENDPOINT = (limit: number, offset: number) =>
  `history?limit=${limit}&offset=${offset}`;
export const API_AUTH_REFRESH_ENDPOINT = "/refresh";
export const API_AUTH_LOGIN_ENDPOINT = "/auth/login";
export const API_AUTH_ME_ENDPOINT = "/me";
export const API_ADMIN_USERS_ENDPOINT = "/admin/users";
