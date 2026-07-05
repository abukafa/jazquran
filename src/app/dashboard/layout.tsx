import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import HeroCard from "@/components/HeroCard";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Use Node.js runtime to read the session securely
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  const tenantId = (session.user as any).tenantId;

  if (role !== "super-admin" && !tenantId) {
    redirect("/onboarding");
  }

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-y-auto pb-24 relative flex flex-col">
        <div className="px-5 pt-6 pb-2">
          <HeroCard />
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
