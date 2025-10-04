import { Outlet } from "react-router-dom";
import { HeaderDetail } from "./header-detail";
import { FooterHome } from "../home-layout/footer-home";


export const DetailMainLayout = () => {
    return (
        <>
            <HeaderDetail />
            <Outlet />
            <FooterHome />
        </>
    );
};