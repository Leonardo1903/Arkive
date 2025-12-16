import SignUpForm from "@/components/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-accent/10 dark:via-primary/10 dark:to-accent/5">
      <main className="flex-1 flex justify-center items-center p-6">
        <SignUpForm />
      </main>
    </div>
  );
}
