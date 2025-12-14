import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  const fullName = user?.fullName ?? "User";
  const email =
    user?.primaryEmailAddress?.emailAddress ?? "no-email@placeholder.test";
  const avatar = user?.imageUrl ?? "";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar fullName={fullName} email={email} avatar={avatar} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Header />
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
