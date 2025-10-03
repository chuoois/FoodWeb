import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  AuthLayout,
  HomeMainLayout,
  MenuListMainLayout
  DetailMainLayout
} from "@/components/layouts";

import {
  HomePage,
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  MenuListPage,
  VerifyOtpForm

} from "@/pages";

const router = createBrowserRouter([
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginForm/>,
      },
      {
        path: "register",
        element: <RegisterForm/>,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordForm/>,
      },
      {
        path: "verify-otp",
        element: <VerifyOtpForm/>,
      },
    ],
  },
  {
    path: "/",
    element: <HomeMainLayout />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      
    ],
  },
    {
    path: "menu",
    element: <MenuListMainLayout />,
    children: [
      {
        path: "list/:category",
        element: <MenuListPage/>,
      },
      
    ],
  },
  {
    path: "detail",
    element: <DetailMainLayout />,
    children: [
      {
        path: "",
        element: <div>Đây là ... page</div>,
      },
      {
        path: "product",
        element: <div>Đây là product page</div>,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
