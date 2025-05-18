export interface User {
  _id: string;
  email: string;
  password: string;
  role: string;
  toObject(): Record<string, any>;
}

export interface UserResponse {
  _id: string;
  email: string;
  role: string;
  toObject(): Record<string, any>;
}
