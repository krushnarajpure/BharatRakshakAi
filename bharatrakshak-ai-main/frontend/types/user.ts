export type UserRole = "citizen" | "responder" | "authority";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  state: string;
  district: string;
  address: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
  photoURL: string;
  /** Responder-specific optional fields */
  employeeId?: string;
  teamCode?: string;
  /** Authority-specific optional fields */
  officerId?: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  state: string;
  district: string;
  address: string;
  password: string;
  role?: UserRole;
}
