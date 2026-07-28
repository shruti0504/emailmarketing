import api from "@/lib/api";
import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
} from "@/types/auth";

class AuthService {
  login(data: LoginRequest) {
    return api.post<AuthResponse>("/auth/login", data);
  }

  signup(data: SignupRequest) {
    return api.post<AuthResponse>("/auth/signup", data);
  }

  me() {
    return api.get("/auth/me");
  }
}

export default new AuthService();