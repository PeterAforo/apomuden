"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, Building2, Bell, BarChart3, FileText, 
  Users, Settings, LogOut, ChevronLeft, ChevronRight,
  Activity, Map, Shield, Brain, TrendingUp, AlertTriangle,
  Menu, X
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "text-red-700", bgColor: "bg-red-100" },
  MINISTRY_ADMIN: { label: "Ministry Admin", color: "text-purple-700", bgColor: "bg-purple-100" },
  ANALYST: { label: "Health Analyst", color: "text-blue-700", bgColor: "bg-blue-100" },
  REGIONAL_DIRECTOR: { label: "Regional Director", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  DISTRICT_OFFICER: { label: "District Officer", color: "text-amber-700", bgColor: "bg-amber-100" },
};

const NAV_ITEMS = [
  { 
    href: "/admin", 
    icon: LayoutDashboard, 
    label: "Dashboard",
    roles: ["SUPER_ADMIN", "MINISTRY_ADMIN", "ANALYST", "REGIONAL_DIRECTOR", "DISTRICT_OFFICER"]
  },
  { 
    href: "/admin/facilities", 
    icon: Building2, 
    label: "Facilities",
    roles: ["SUPER_ADMIN", "MINISTRY_ADMIN", "REGIONAL_DIRECTOR", "DISTRICT_OFFICER"]
  },
  { 
    href: "/admin/analytics", 
    icon: BarChart3, 
    label: "Analytics",
    roles: ["SUPER_ADMIN", "MINISTRY_ADMIN", "ANALYST"]
  },
  { 
    href: "/admin/alerts", 
    icon: Bell, 
    label: "Health Alerts",
    roles: ["SUPER_ADMIN", "MINISTRY_ADMIN", "ANALYST"]
  },
  { 
    href: "/admin/surveillance", 
    icon: Activity, 
    label: "Disease Surveillance",
    roles: ["SUPER_ADMIN", "MINISTRY_ADMIN", "ANALYST"]
  },
  { 
    href: "/admin/ai-insights", 
    icon: Brain, 
    label: "AI Insights",
    roles: ["SUPER_ADMIN", "ANALYST"]
  },
  { 
    href: "/admin/reports", 
    icon: FileText, 
    label: "Reports",
    roles: ["SUPER_ADMIN", "MINISTRY_ADMIN", "ANALYST", "REGIONAL_DIRECTOR"]
  },
  { 
    href: "/admin/users", 
    icon: Users, 
    label: "User Management",
    roles: ["SUPER_ADMIN"]
  },
  { 
    href: "/admin/audit", 
    icon: Shield, 
    label: "Audit Logs",
    roles: ["SUPER_ADMIN"]
  },
  { 
    href: "/admin/settings", 
    icon: Settings, 
    label: "Settings",
    roles: ["SUPER_ADMIN", "MINISTRY_ADMIN"]
  },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.DISTRICT_OFFICER;
  const filteredNavItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-emerald-700">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-800 font-bold text-xl">O</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-white font-bold text-lg block">OneHealthGH</span>
              <span className="text-emerald-200 text-xs">Admin Portal</span>
            </div>
          )}
        </Link>
      </div>

      {/* User Info */}
      <div className={`p-4 border-b border-emerald-700 ${collapsed ? "text-center" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">
              {user.name?.charAt(0) || user.email?.charAt(0) || "A"}
            </span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-medium text-sm truncate">{user.name || "Admin"}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${roleConfig.bgColor} ${roleConfig.color}`}>
                {roleConfig.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/admin" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-white text-emerald-800 font-medium shadow-md"
                  : "text-emerald-100 hover:bg-emerald-700"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-emerald-600" : ""}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-emerald-700">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-200 hover:bg-red-600 hover:text-white transition-all w-full ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle - Desktop Only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-white rounded-full shadow-md items-center justify-center text-emerald-800 hover:bg-emerald-50"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-800 text-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-emerald-800 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-emerald-800 relative transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
