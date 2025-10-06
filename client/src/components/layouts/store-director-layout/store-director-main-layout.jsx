import { Outlet } from "react-router-dom";
import { SidebarStoreDirectorLayout } from "./side-bar-store-director";

export const StoreDirectorLayout = () => {
  return (
    <SidebarStoreDirectorLayout>
      <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
        <Outlet />
      </div>
    </SidebarStoreDirectorLayout>
  );
};
