import { Outlet } from "react-router-dom";
import { HeaderDashboard } from "./header-dashboard";


export const DashboardMainLayout = () => {
    return (
        <>
            <HeaderDashboard />
            <Outlet />
        </>
    );
};