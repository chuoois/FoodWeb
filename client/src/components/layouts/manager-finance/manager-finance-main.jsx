import { Outlet } from "react-router-dom";
import { ManagerFinanceLayout } from "./manager-finance-layout";

export const ManagerFinanceMain = () => {
  return (
    <ManagerFinanceLayout>
      <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
        <Outlet />
      </div>
    </ManagerFinanceLayout>
  );
};
