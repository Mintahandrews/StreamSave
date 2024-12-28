export interface User {
  id: string;
  email: string;
  // Add other user properties
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
