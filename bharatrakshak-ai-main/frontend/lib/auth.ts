import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  createUserProfile,
  getUserProfile,
  updateLastLogin,
} from "@/lib/firestore";
import type { RegisterUserData, UserProfile, UserRole } from "@/types/user";

function mapFirebaseError(code: string): string {
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password is too weak. Use at least 8 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return messages[code] ?? "Authentication failed. Please try again.";
}

export async function registerWithEmail(
  data: RegisterUserData
): Promise<{ user: User; profile: UserProfile }> {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      data.email.trim().toLowerCase(),
      data.password
    );

    await updateProfile(credential.user, {
      displayName: data.name.trim(),
    });

    await sendEmailVerification(credential.user);

    const role: UserRole = data.role ?? "citizen";
    await createUserProfile(credential.user.uid, {
      ...data,
      email: data.email.trim().toLowerCase(),
      role,
      photoURL: credential.user.photoURL ?? "",
    });

    const profile = await getUserProfile(credential.user.uid);
    if (!profile) {
      throw new Error("Failed to save user profile.");
    }

    return { user: credential.user, profile };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    throw new Error(code ? mapFirebaseError(code) : (err as Error).message);
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ user: User; profile: UserProfile }> {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );

    let profile = await getUserProfile(credential.user.uid);

    if (!profile) {
      await createUserProfile(credential.user.uid, {
        name: credential.user.displayName ?? "User",
        email: credential.user.email ?? email,
        phone: credential.user.phoneNumber ?? "",
        dob: "",
        gender: "",
        state: "",
        district: "",
        address: "",
        password: "",
        role: "citizen",
        photoURL: credential.user.photoURL ?? "",
      });
      profile = await getUserProfile(credential.user.uid);
    }

    if (!profile) {
      throw new Error("Unable to load user profile.");
    }

    await updateLastLogin(credential.user.uid);
    profile.lastLogin = new Date().toISOString();

    return { user: credential.user, profile };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    throw new Error(code ? mapFirebaseError(code) : (err as Error).message);
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    throw new Error(code ? mapFirebaseError(code) : (err as Error).message);
  }
}

export { mapFirebaseError };
