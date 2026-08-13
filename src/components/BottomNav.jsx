import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MapPin, User, Users, Settings } from "lucide-react";

const tabs = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/myvisits", icon: MapPin, label: "My Visits" },
  { path: "/profil", icon: User, label: "Profil" },
  { path: "/users", icon: Users, label: "Users" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    if (path === "/profil") return pathname.startsWith("/profil") || pathname.startsWith("/profile");
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors ${
                active ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className={`text-[10px] leading-tight ${active ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
