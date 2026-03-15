import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  const allowedRoles = ["SUPER_ADMIN", "MINISTRY_ADMIN", "ANALYST", "REGIONAL_DIRECTOR", "DISTRICT_OFFICER"];
  const userRole = (session.user as { role?: string })?.role || "";
  
  if (!allowedRoles.includes(userRole)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar user={{ ...session.user, role: userRole }} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
