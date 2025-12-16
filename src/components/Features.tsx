import { Card } from "@/components/ui/card";
import { Shield, FolderOpen, Smartphone } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Shield,
      title: "Secure Storage",
      description:
        "Enterprise-grade encryption keeps your files safe and private. Your data, your control.",
      color: "text-primary",
    },
    {
      icon: FolderOpen,
      title: "Smart Organization",
      description:
        "Intelligent folder structure and search make finding files effortless. Stay organized, stay productive.",
      color: "text-accent",
    },
    {
      icon: Smartphone,
      title: "Cross-Platform Access",
      description:
        "Access your files anywhere, anytime. Seamless sync across all your devices.",
      color: "text-secondary",
    },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-4xl font-bold md:text-5xl">
            Everything you need
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Powerful features designed to make file management effortless and
            secure
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-2 p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div
                  className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ${feature.color} transition-transform group-hover:rotate-[360deg] duration-700`}
                >
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
