import api from "./api";
import { UserRole, type AuthResponse } from "../types";

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  language?: string;
  company?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
