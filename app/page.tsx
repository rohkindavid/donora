import { LoginForm } from "./login-form"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function Home() {
  await connection()

  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.GABBAI_USER_ID,
  )

  if (authConfigured) {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase!.auth.getUser()

    if (data.user?.id === process.env.GABBAI_USER_ID) {
      redirect("/dashboard")
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Secure workspace
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-400">Donora</p>
            <h1 className="max-w-xl text-5xl font-black tracking-tight text-white md:text-6xl">
              Welcome back.
            </h1>
            <p className="max-w-lg text-lg text-slate-300">
              Sign in to manage projects, review delivery progress, and keep your team moving.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-black text-white">24</div>
              <div className="text-sm text-slate-400">Active projects</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-black text-white">92%</div>
              <div className="text-sm text-slate-400">Health score</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-black text-white">184</div>
              <div className="text-sm text-slate-400">Tasks closed</div>
            </div>
          </div>
        </section>

        <LoginForm authConfigured={authConfigured} />
      </div>
    </main>
  );
}
