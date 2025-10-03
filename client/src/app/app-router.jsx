import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  AuthLayout,
  HomeMainLayout,
  MenuListMainLayout
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
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
