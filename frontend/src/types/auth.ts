export interface Workspace {
  id: string;
  companyName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  workspace: Workspace;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  companyName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: User;
}