export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Sign Up",
      description: "Create your account in seconds with secure authentication",
    },
    {
      number: "02",
      title: "Upload",
      description: "Drag and drop your files or folders to get started",
    },
    {
      number: "03",
      title: "Access Anywhere",
      description: "Your files are ready whenever and wherever you need them",
    },
  ];

  return (
    <section className="bg-muted/30 py-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-4xl font-bold md:text-5xl">
            Get started in minutes
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Three simple steps to transform your file storage experience
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-16 hidden h-px w-full bg-gradient-to-r from-primary to-transparent md:block" />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-background font-serif text-3xl font-bold text-primary shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
