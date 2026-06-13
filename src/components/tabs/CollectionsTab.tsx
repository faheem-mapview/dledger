"use client"

import { type FoodItem, type ExerciseItem, type WorkItem, type ScreenItem, type Task, type UserSettings, type WeightLog, sum, round1, KCAL_PER_KG, today } from "@/lib/firestore"

interface Props {
  food: FoodItem[]; exercise: ExerciseItem[]; work: WorkItem[]
  screen: ScreenItem[]; tasks: Task[]; settings: UserSettings; weights: WeightLog[]
}

export function CollectionsTab({ food, exercise, work, screen, tasks, settings, weights }: Props) {
  const allItems = [...food, ...exercise, ...work, ...screen, ...tasks]
  const dates = [...new Set(allItems.map((x) => x.date).filter(Boolean))].sort().reverse()

  if (!dates.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
        <p className="font-medium text-foreground">Nothing logged yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Your daily summaries will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {dates.map((d) => {
        const cIn = sum(food.filter((x) => x.date === d), (x) => x.calories)
        const cOut = sum(exercise.filter((x) => x.date === d), (x) => x.calories)
        const workH = sum(work.filter((x) => x.date === d), (x) => x.hours)
        const screenH = sum(screen.filter((x) => x.date === d), (x) => x.hours)
        const meals = food.filter((x) => x.date === d).length
        const hotel = food.filter((x) => x.date === d && x.source === "hotel").length
        const tasksDone = tasks.filter((x) => x.date === d && x.done).length
        const maint = Number(settings.maintenance) || 0
        const balance = maint ? cIn - (maint + cOut) : null
        const kg = balance !== null ? balance / KCAL_PER_KG : null
        const losing = kg !== null && kg < 0
        const label = new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
        const weightLog = weights.find((w) => w.date === d)

        return (
          <div key={d} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">{label}</p>
                {d === today() && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">Today</span>}
                {weightLog && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    ⚖ {weightLog.kg} kg
                  </span>
                )}
              </div>
              {kg !== null && (cIn > 0 || cOut > 0) && (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${losing ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-600"}`}>
                  {losing ? "−" : "+"}{Math.abs(round1(kg * 100) / 100).toFixed(2)} kg
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {[
                { v: cIn, k: "kcal eaten", cls: "text-emerald-600" },
                { v: cOut, k: "kcal burned", cls: "text-orange-500" },
                { v: `${meals} (${hotel}✕)`, k: "meals", cls: "text-foreground" },
                { v: `${round1(workH)}h`, k: "work", cls: "text-blue-600" },
                { v: `${round1(screenH)}h`, k: "screen", cls: "text-rose-500" },
                { v: tasksDone, k: "tasks done", cls: "text-primary" },
              ].map(({ v, k, cls }) => (
                <div key={k} className="rounded-lg bg-muted p-3">
                  <p className={`font-bold text-base leading-none ${cls}`}>{v}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{k}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
