export interface LoginCredentials {
  username: string;
}

export interface ChallengeResponse {
  challenge: string;
  timestamp: number;
  message: string;
  instructions: string;
}

export interface VerifyRequest {
  username: string;
  challenge: string;
  timestamp: number;
  signature: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  refreshToken: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}