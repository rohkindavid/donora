import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot write cookies; proxy.ts refreshes sessions.
        }
      },
    },
  })
}

export async function requireAuthorizedUser() {
  const allowedUserId = process.env.GABBAI_USER_ID
  const supabase = await createSupabaseServerClient()

  if (!supabase || !allowedUserId) {
    redirect("/")
  }

  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user || data.user.id !== allowedUserId) {
    redirect("/")
  }

  return { supabase, user: data.user }
}