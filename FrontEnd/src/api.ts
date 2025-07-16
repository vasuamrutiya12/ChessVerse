// src/api.ts
const BASE_URL = 'http://localhost:3000';
export function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${BASE_URL}${path}`, options);
}

// If you use axios:
import axios from 'axios';
export const apiAxios = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // if you use cookies
});
