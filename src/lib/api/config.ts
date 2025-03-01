const API_CONFIG = {
  baseURL: "https://all-media-downloader1.p.rapidapi.com",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const axiosConfig = {
  ...API_CONFIG,
  validateStatus: (status: number) => status < 500,
  withCredentials: true,
};

export const ENDPOINTS = {
  health: "/api/health",
  info: "/api/info",
  download: "/api/download",
} as const;

export default API_CONFIG;
