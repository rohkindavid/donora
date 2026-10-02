import { signOut } from "../actions/auth"
import { prisma } from "@/db/client"
import { requireAuthorizedUser } from "@/lib/supabase/server"
import { connection } from "next/server"

const hebrewMonths = [
  "",
  "ניסן",
  "אייר",
  "סיוון",
  "תמוז",
  "אב",
  "אלול",
  "תשרי",
  "חשוון",
  "כסלו",
  "טבת",
  "שבט",
  "אדר",
  "אדר ב׳",
]

const currency = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
})

export default async function DashboardPage() {
  await connection()

  const { user } = await requireAuthorizedUser()
  const email = user.email ?? ""
  let data = null
  let dataUnavailable = false

  if (process.env.DATABASE_URL) {
    try {
      const [activeMembers, pendingContributions, overdueContributions, paidTotal, cycles] = await Promise.all([
        prisma.member.count({ where: { isActive: true } }),
        prisma.contribution.count({ where: { status: "PENDING" } }),
        prisma.contribution.count({ where: { status: "OVERDUE" } }),
        prisma.contribution.aggregate({
          where: { status: "PAID" },
          _sum: { actualAmount: true },
        }),
        prisma.monthlyCycle.findMany({
          where: { status: "OPEN" },
          orderBy: { startsAt: "asc" },
          take: 2,
          include: {
            contributions: {
              select: {
                pledgedAmount: true,
                actualAmount: true,
                status: true,
              },
            },
          },
        }),
      ])

      data = {
        activeMembers,
        pendingContributions,
        overdueContributions,
        paidTotal: Number(paidTotal._sum.actualAmount ?? 0),
        cycles: cycles.map((cycle) => ({
          id: cycle.id,
          month: hebrewMonths[cycle.hebrewMonth] ?? "מחזור חודשי",
          year: cycle.hebrewYear,
          target: cycle.targetGoal ? Number(cycle.targetGoal) : null,
          pledged: cycle.contributions.reduce((sum, item) => sum + Number(item.pledgedAmount), 0),
          received: cycle.contributions.reduce(
            (sum, item) => sum + (item.status === "PAID" ? Number(item.actualAmount ?? 0) : 0),
            0,
          ),
          contributionCount: cycle.contributions.length,
        })),
      }
    } catch {
      dataUnavailable = true
    }
  }

  const formattedEmail = email || "חשבון הגבאי"

  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Donora</p>
            <h1 className="mt-1 text-xl font-semibold">ניהול תרומות</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
              {formattedEmail}
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                יציאה
              </button>
            </form>
          </div>
        </header>

        <header className="mb-8">
          <p className="text-sm text-emerald-300">שלום, {formattedEmail}</p>
          <h2 className="mt-2 text-3xl font-black">תמונת מצב</h2>
          <p className="mt-2 text-slate-300">מחזורי התרומות, החברים וההתחייבויות של השיעור.</p>
        </header>

        {!process.env.DATABASE_URL ? (
          <section className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6" role="status">
            <h3 className="text-lg font-semibold text-amber-100">בסיס הנתונים עדיין לא מחובר</h3>
            <p className="mt-2 text-sm text-amber-100/80">
              כדי להציג נתונים, יש להגדיר את DATABASE_URL ו־DIRECT_URL לפי הקובץ .env.example ולהחיל את סכמת Prisma.
            </p>
          </section>
        ) : dataUnavailable ? (
          <section className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6" role="alert">
            <h3 className="text-lg font-semibold text-rose-100">לא ניתן לטעון את נתוני המערכת</h3>
            <p className="mt-2 text-sm text-rose-100/80">בדוק את חיבור בסיס הנתונים ונסה שוב.</p>
          </section>
        ) : data ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "חברים פעילים", value: data.activeMembers },
                { label: "ממתינות לתשלום", value: data.pendingContributions },
                { label: "באיחור", value: data.overdueContributions },
                { label: "התקבלו בפועל", value: currency.format(data.paidTotal) },
              ].map((metric) => (
                <article key={metric.label} className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-400">{metric.label}</p>
                  <p className="mt-3 text-3xl font-bold text-white">{metric.value}</p>
                </article>
              ))}
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">תרומות</p>
                  <h3 className="text-2xl font-bold">מחזורים פתוחים</h3>
                </div>
              </div>

              {data.cycles.length ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {data.cycles.map((cycle) => {
                    const goalProgress = cycle.target ? Math.min(100, Math.round((cycle.pledged / cycle.target) * 100)) : null

                    return (
                      <article key={cycle.id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-xl font-semibold">{cycle.month} {cycle.year}</h4>
                            <p className="mt-1 text-sm text-slate-400">{cycle.contributionCount} התחייבויות</p>
                          </div>
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">פתוח</span>
                        </div>

                        <dl className="mt-6 grid grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm text-slate-400">התחייבויות</dt>
                            <dd className="mt-1 text-lg font-semibold">{currency.format(cycle.pledged)}</dd>
                          </div>
                          <div>
                            <dt className="text-sm text-slate-400">התקבל בפועל</dt>
                            <dd className="mt-1 text-lg font-semibold">{currency.format(cycle.received)}</dd>
                          </div>
                        </dl>

                        {cycle.target !== null ? (
                          <div className="mt-5">
                            <div className="mb-2 flex justify-between text-sm text-slate-400">
                              <span>יעד: {currency.format(cycle.target)}</span>
                              <span>{goalProgress}%</span>
                            </div>
                            <div
                              className="h-2 overflow-hidden rounded-full bg-slate-700"
                              role="progressbar"
                              aria-label={`התקדמות לעבר היעד ${currency.format(cycle.target)}`}
                              aria-valuenow={goalProgress ?? 0}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${goalProgress}%` }} />
                            </div>
                          </div>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/50 p-8 text-center">
                  <h4 className="font-semibold">אין כרגע מחזור פתוח</h4>
                  <p className="mt-2 text-sm text-slate-400">מחזור התרומות הבא יופיע כאן לאחר פתיחתו.</p>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
