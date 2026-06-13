"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithGoogle } from "@/lib/auth"
import { LayoutDashboard, CheckSquare, UtensilsCrossed, Dumbbell, Monitor } from "lucide-react"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

const features = [
  { icon: UtensilsCrossed, label: "Food & Calorie Tracking" },
  { icon: Dumbbell, label: "Exercise & Burn" },
  { icon: CheckSquare, label: "Tasks & Priorities" },
  { icon: Monitor, label: "Work & Screen Time" },
]

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignIn() {
    setError(""); setLoading(true)
    try {
      await signInWithGoogle()
      router.push("/dashboard")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ""
      if (!msg.includes("popup-closed-by-user") && !msg.includes("cancelled-popup-request"))
        setError("Sign in failed. Please try again.")
    } finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex w-80 flex-shrink-0 flex-col justify-between border-r border-border bg-card p-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="font-semibold">Daily Ledger</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold leading-snug mb-3">Track your day,<br />own your life.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Log food, exercise, tasks, work hours and screen time — all synced to your account.
          </p>
          <div className="space-y-3">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 Daily Ledger</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="font-semibold">Daily Ledger</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in with your Google account to continue</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <button onClick={handleGoogleSignIn} disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60">
              <GoogleIcon />
              {loading ? "Signing in…" : "Continue with Google"}
            </button>
            {error && (
              <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">{error}</p>
            )}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Your data is stored securely in Firebase.
          </p>
        </div>
      </div>
    </div>
  )
}
