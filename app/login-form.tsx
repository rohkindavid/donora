"use client"

import { useActionState } from "react"
import { signIn, type LoginState } from "./actions/auth"

const initialState: LoginState = {}

export function LoginForm({ authConfigured }: { authConfigured: boolean }) {
  const [state, action, pending] = useActionState(signIn, initialState)

  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
      <div className="mb-6">
        <p className="text-sm text-slate-400">Sign in</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Access your workspace</h2>
      </div>

      {!authConfigured ? (
        <p className="mb-5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200" role="status">
          Supabase sign-in is not configured on this server yet.
        </p>
      ) : null}

      <form action={action} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-200">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-200">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
          />
        </div>

        {state.error ? (
          <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!authConfigured || pending}
          className="block w-full rounded-xl bg-emerald-400 px-4 py-3 text-center font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </section>
  )
}