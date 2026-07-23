export interface SignupDto {
  name: string;
  companyName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}