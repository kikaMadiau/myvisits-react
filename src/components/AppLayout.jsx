import { Outlet } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}