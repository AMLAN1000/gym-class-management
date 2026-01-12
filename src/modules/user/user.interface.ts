import { UserRole } from "@prisma/client";

export interface ICreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
}
