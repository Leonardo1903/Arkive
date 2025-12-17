"use client";

import { Button } from "@/components/ui/button";
import {
  Upload,
  FolderOpen,
  Shield,
  Zap,
  Star,
  ArrowRight,
  Cloud,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,var(--primary)_0%,transparent_50%)] opacity-10" />
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <Star className="h-4 w-4 fill-primary" />
            Trusted by thousands of users
          </div>
          <h1 className="mb-6 font-serif text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Your Files,
            <br />
            <span className="text-primary">Perfectly Organized</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Experience cloud storage reimagined. Secure, intuitive, and
            lightning-fast. Arkive keeps your digital life organized and
            accessible.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="group min-w-[200px]"
              onClick={() => router.push("/sign-up")}
            >
              <Upload className="mr-2 h-5 w-5" />
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-[200px] transition-all hover:scale-105"
            >
              <Zap className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-primary" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="pointer-events-none absolute left-[5%] top-[20%] hidden lg:block animate-[float_6s_ease-in-out_infinite]">
        <div className="rounded-2xl bg-primary/30 p-6 shadow-xl backdrop-blur-sm border-2 border-primary/50">
          <FolderOpen
            className="h-12 w-12 text-primary drop-shadow-2xl"
            strokeWidth={2.5}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute right-[5%] top-[25%] hidden lg:block animate-[float_8s_ease-in-out_infinite_2s]">
        <div className="rounded-2xl bg-primary/30 p-6 shadow-xl backdrop-blur-sm border-2 border-primary/50">
          <Upload
            className="h-12 w-12 text-primary drop-shadow-2xl"
            strokeWidth={2.5}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute left-[10%] bottom-[15%] hidden md:block animate-[float_7s_ease-in-out_infinite_1s]">
        <div className="rounded-2xl bg-chart-4/30 p-5 shadow-xl backdrop-blur-sm border-2 border-chart-4/50">
          <Shield
            className="h-10 w-10 text-chart-4 drop-shadow-2xl"
            strokeWidth={2.5}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute right-[8%] bottom-[20%] hidden md:block animate-[float_9s_ease-in-out_infinite_3s]">
        <div className="rounded-2xl bg-chart-2/30 p-5 shadow-xl backdrop-blur-sm border-2 border-chart-2/50">
          <Zap
            className="h-10 w-10 text-chart-2 drop-shadow-2xl"
            strokeWidth={2.5}
          />
        </div>
      </div>
    </section>
  );
}
