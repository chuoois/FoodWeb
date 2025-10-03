import { Outlet } from "react-router-dom";
import { HeaderMenuList } from "./header-menu-list"


export const MenuListMainLayout = () => {
    return (
        <>
            <HeaderMenuList />
            <Outlet />
        </>
    );
};