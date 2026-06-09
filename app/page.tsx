import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserGuideDialog } from "@/components/UserGuideDialog";
import { ArrowRight, BarChart3, Building2, Brain, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">AgileReady</span>
          </div>
          <UserGuideDialog />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section 1 */}
        <section className="py-24 lg:py-32 bg-orange-50/50 dark:bg-background relative overflow-hidden">
          {/* Subtle Background Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Content */}
              <div className="text-left space-y-8 z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-semibold mb-2 border border-orange-200 dark:border-orange-500/30 shadow-sm">
                  🚀 Elevate Your Workflow
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                  Assess Your Organization&apos;s <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Agile & AI Readiness</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Empower your team with deep insights into Agile maturity using the Sidky Agile Adoption Framework and measure your AI capability footprint.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <Link href="/admin/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full text-md h-14 px-8 shadow-lg shadow-orange-500/25 transition-transform hover:-translate-y-1">
                      Register Company
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <div className="flex w-full sm:w-auto gap-4">
                    <Link href="/admin/login" className="flex-1 sm:flex-none">
                      <Button variant="outline" size="lg" className="w-full text-md h-14 px-6 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform hover:-translate-y-1">
                        Admin Login
                      </Button>
                    </Link>
                    <Link href="/employee/login" className="flex-1 sm:flex-none">
                      <Button variant="secondary" size="lg" className="w-full text-md h-14 px-6 bg-orange-100 hover:bg-orange-200 text-orange-900 transition-transform hover:-translate-y-1">
                        Employee
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual/Graphic */}
              <div className="relative hidden lg:block z-10">
                {/* Decorative blob or background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-orange-400/30 to-amber-300/30 rounded-full blur-3xl animate-pulse duration-10000" />
                
                {/* Dashboard-like illustration using CSS/Tailwind */}
                <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500 mx-auto max-w-md">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Dashboard Preview</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-28 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30 flex flex-col justify-center items-center p-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center mb-3">
                          <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="w-16 h-2 bg-orange-200 dark:bg-orange-700 rounded-full" />
                        <div className="w-10 h-2 bg-orange-200 dark:bg-orange-700 rounded-full mt-2" />
                      </div>
                      <div className="h-28 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex flex-col justify-center items-center p-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mb-3">
                          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="w-20 h-2 bg-blue-200 dark:bg-blue-700 rounded-full" />
                        <div className="w-12 h-2 bg-blue-200 dark:bg-blue-700 rounded-full mt-2" />
                      </div>
                    </div>
                    <div className="h-44 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700 p-5">
                       <div className="w-full h-full border-b border-l border-slate-200 dark:border-slate-600 relative overflow-hidden">
                          {/* Pseudo Chart Line */}
                          <svg className="w-full h-full drop-shadow-md" preserveAspectRatio="none" viewBox="0 0 100 100">
                             <path d="M0,90 L20,60 L40,75 L60,30 L80,45 L100,10" fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                          </svg>
                          <div className="absolute top-2 right-2 w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded-full" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section 2 (Bento Grid) */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Why AgileReady?</h2>
              <p className="text-muted-foreground">Comprehensive metrics tailored for modern organizational transformation.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              
              {/* SAAF Card */}
              <div className="lg:col-span-2 rounded-3xl border bg-card p-8 shadow-sm flex flex-col justify-center">
                <Building2 className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Sidky Agile Adoption Framework</h3>
                <p className="text-muted-foreground mb-6">
                  Navigate through the five levels of Agile maturity: Collaborative, Evolutionary, Integrated, Adaptive, and Encompassing.
                </p>
                <ul className="space-y-2">
                  {['Assess current agile practices', 'Identify adoption roadblocks', 'Actionable maturity roadmaps'].map((item, i) => (
                    <li key={i} className="flex items-center text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-primary mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Metrics Card */}
              <div className="rounded-3xl border bg-card p-8 shadow-sm flex flex-col justify-center bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                <Brain className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI Adoption Metrics</h3>
                <p className="text-muted-foreground text-sm">
                  Gauge your organization&apos;s readiness to integrate AI tools into daily workflows securely and efficiently.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AgileReady. All rights reserved.</p>
      </footer>
    </div>
  );
}
