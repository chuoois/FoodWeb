import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  AuthLayout,
  HomeMainLayout
} from "@/components/layouts";

import {
  HomePage
} from "@/pages";

const router = createBrowserRouter([
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <div>Login Page</div>,
      },
      {
        path: "register",
        element: <div>Register Page</div>,
      },
      {
        path: "forgot-password",
        element: <div>Forgot Password Page</div>,
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
