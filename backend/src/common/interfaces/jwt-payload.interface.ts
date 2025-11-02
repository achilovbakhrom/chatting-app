import { UserRole } from '../enums';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
}
