import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile, RegisterUserData, UserRole } from "@/types/user";

const USERS_COLLECTION = "users";

export async function createUserProfile(
  uid: string,
  data: RegisterUserData & { role: UserRole; photoURL?: string }
): Promise<void> {
  const now = new Date().toISOString();
  const profile: UserProfile = {
    uid,
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone,
    dob: data.dob,
    gender: data.gender,
    state: data.state,
    district: data.district,
    address: data.address,
    role: data.role,
    createdAt: now,
    lastLogin: now,
    photoURL: data.photoURL ?? "",
  };

  await setDoc(doc(db, USERS_COLLECTION, uid), profile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateLastLogin(uid: string): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    lastLogin: new Date().toISOString(),
  });
}

export function getRoleRedirectPath(role: UserRole): string {
  switch (role) {
    case "citizen":
      return "/portal/citizen";
    case "responder":
      return "/portal/responder";
    case "authority":
      return "/portal/admin";
    default:
      return "/dashboard";
  }
}
