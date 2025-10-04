// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import { SidebarAdmin } from "./sidebar-layout";

export const DashboardMainLayout = () => {
  return (
    <div className="min-h-screen bg-[#F7EFDF] flex">
      <SidebarAdmin />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};
