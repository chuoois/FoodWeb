// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar-layout";

export const DashboardMainLayout = () => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
