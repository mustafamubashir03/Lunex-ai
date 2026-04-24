"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Globe, Code2, FileSearch } from "lucide-react";
import { authClient } from "@/lib/auth-client";



const Login = () => {
    const signIn = async () => {
        await authClient.signIn.social({
          provider: "google",
        });
      };
  return (
        <div className="h-screen w-full bg-background flex overflow-hidden">
    
          {/* ── Left panel ──────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col justify-between w-1/2 border-r border-border px-14 py-12">
    
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground">
                Lunex<span className="text-muted-foreground">.AI</span>
              </span>
            </div>
    
            {/* Hero copy */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <Badge variant="secondary" className="w-fit text-sm font-medium px-3 py-1">
                  Now in Early Access
                </Badge>
                <h2 className="text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                  Stop prompting.
                  <br />
                  <span className="text-muted-foreground">Start delegating.</span>
                </h2>
                <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
                  Hand off real tasks and walk away. Lunex acts — browsing, coding,
                  researching — start to finish, on its own.
                </p>
              </div>
    
              {/* Feature cards */}
              <div className="flex flex-col gap-2.5">
                {[
                  { icon: Globe,       label: "Browses the web like you would",  desc: "Navigates, clicks, and extracts — across any site." },
                  { icon: Code2,       label: "Writes code. Runs it. Ships it.", desc: "Full execution loop, no copy-pasting required." },
                  { icon: FileSearch,  label: "Researches so you don't have to", desc: "Dozens of sources, one clean summary delivered." },
                ].map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="flex items-start gap-4 rounded-xl border border-border bg-card px-4 py-3.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">{label}</span>
                      <span className="text-sm text-muted-foreground">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
    
            {/* Footer quote */}
            <p className="text-sm text-muted-foreground/50 italic">
              The work gets done. You just decide what next?.
            </p>
          </aside>
    
          {/* ── Right panel — dead center ────────────────────────── */}
          <main className="flex flex-1 flex-col items-center justify-center px-6">
    
            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-10 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Lunex<span className="text-muted-foreground">.AI</span>
              </span>
            </div>
    
            <div className="flex w-full max-w-[380px] flex-col items-center gap-8">
    
              {/* Heading */}
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                  Welcome back
                </h1>
                <p className="text-base text-muted-foreground">
                  Sign in to put Lunex back to work.
                </p>
              </div>
    
              {/* Google button */}
              <div className="flex w-full flex-col gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={signIn}
                  className="cursor-pointer w-full h-[52px] gap-3 rounded-xl text-base font-medium"
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  No password needed — simple and secure.
                </p>
              </div>
    
              {/* ToS */}
              <p className="text-center text-xs text-muted-foreground leading-relaxed">
                By continuing you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-4 hover:text-foreground transition-colors">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
    
            </div>
          </main>
        </div>
      );
}

function GoogleIcon() {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    );
  }
export default Login