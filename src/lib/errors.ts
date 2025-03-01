import { AxiosError } from "axios";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
  }

  static fromAxiosError(error: AxiosError<{ message?: string }>): AppError {
    if (error.response) {
      return new AppError(
        error.response.data?.message || error.message,
        error.code,
        error.response.status
      );
    }
    if (error.request) {
      return new AppError("Network request failed", "NETWORK_ERROR");
    }
    return new AppError(error.message, error.code);
  }
}

export class DownloadError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = "DownloadError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string = "Network connection error") {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }

  static checkConnection(): void {
    if (!navigator.onLine) {
      throw new NetworkError(
        "No internet connection. Please check your network and try again."
      );
    }
  }
}

export class AuthError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = "AuthError";
  }
}

export class AnalyticsError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = "AnalyticsError";
  }
}
