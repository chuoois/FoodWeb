import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthLayout } from "@/components/layouts";

import { LoginForm, RegisterForm, ForgotPasswordForm, HomePage, AdminLoginForm, DetailPage, CheckOutPage, FilterPage } from "@/pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/filter",
    element: <FilterPage />,
  },
  {
    path: "/detail/:id",
    element: <DetailPage />,
  },
  {
    path: "/checkout",
    element: <CheckOutPage />,
  },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginForm />,
      },
      {
        path: "login2",
        element: <AdminLoginForm />,
      },
      {
        path: "register",
        element: <RegisterForm />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordForm />,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
