import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { auth } from "@clerk/nextjs/server";
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Header />
          <div className="mt-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-muted/30 p-6 rounded-2xl">{children}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

