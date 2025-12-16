"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CTA() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
      <div className="relative container mx-auto px-6 text-center">
        <h2 className="mb-6 font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
          Ready to transform your storage?
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/90">
          Join thousands of users who trust Arkive with their files. Start
          your free trial today.
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="min-w-[250px] transition-all hover:scale-105"
          onClick={() => router.push("/sign-up")}
        >
          <Upload className="mr-2 h-5 w-5" />
          Start Your Free Trial
        </Button>
      </div>
    </section>
  );
}
