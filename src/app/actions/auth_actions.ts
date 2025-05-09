"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin"; // or wherever you placed it

interface AuthResponse {
  error: null | string;
  success: boolean;
  data: unknown | null;
}

export async function SignUp(formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  // Pre-signup check: See if email already exists in 'profiles' table
  // Use maybeSingle to safely attempt to find the user without throwing an error
  const { data: existingUser, error: existingUserError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUserError) {
    console.error("Error while checking for existing user:", existingUserError);
    return {
      error: "Something went wrong while checking emails.",
      success: false,
      data: null,
    };
  }

  if (existingUser) {
    return {
      error: "Email already in use.",
      success: false,
      data: null,
    };
  }

  // Proceed with sign up
  const { data: signupData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  });

  return {
    error: error?.message || null,
    success: !error,
    data: signupData || null,
  };
}

export async function Login(formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient(); // regular SSR client

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data: loginData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !loginData?.user || !loginData?.session) {
    return {
      error: error?.message || "Login failed",
      success: false,
      data: null,
    };
  }

  const userId = loginData.user.id;

  await supabaseAdmin.auth.admin.signOut(userId,"global");

  return {
    error: null,
    success: true,
    data: loginData,
  };
}

export async function Logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateProfile(values: {
  username: string;
}): Promise<AuthResponse> {
  const supabase = await createClient();
  const username = values.username;

  const { data: profileData, error } = await supabase.auth.updateUser({
    data: { username },
  });
  return {
    error: error?.message || "There was an error updating the profile.",
    success: !error,
    data: profileData || null,
  };
}

export async function resetPassword(values: {
  email: string;
}): Promise<AuthResponse> {
  const supabase = await createClient();

  const { data: resetpasswordData, error } =
    await supabase.auth.resetPasswordForEmail(values.email);
  if (!error) {
    await supabase.auth.signOut();
  }
  return {
    error:
      error?.message || "There was an error sending the reset password email.",
    success: !error,
    data: resetpasswordData || null,
  };
}

export async function changePassword(
  newPassword: string
): Promise<AuthResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return {
    error: error?.message || "There was an error updating password.",
    success: !error,
    data: data || null,
  };
}
