import { Outlet } from "react-router-dom";
import { HeaderCheckOut } from "./header-checkout";
import { FooterHome } from "../home-layout/footer-home";


export const CheckOutMainLayout = () => {
    return (
        <>
            <HeaderCheckOut />
            <Outlet />
            <FooterHome />
        </>
    );
};