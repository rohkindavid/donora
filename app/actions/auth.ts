"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type LoginState = {
  error?: string
}

export async function signIn(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const allowedUserId = process.env.GABBAI_USER_ID
  const supabase = await createSupabaseServerClient()

  if (!supabase || !allowedUserId) {
    return { error: "Sign-in is not configured yet. Add the Supabase settings to the server environment." }
  }

  if (!email || !password) {
    return { error: "Enter your email and password." }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: "The email or password is incorrect." }
  }

  if (data.user.id !== allowedUserId) {
    await supabase.auth.signOut()
    return { error: "This account is not authorized to access Donora." }
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()

  if (supabase) {
    await supabase.auth.signOut()
  }

  redirect("/")
}