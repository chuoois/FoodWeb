import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthLayout } from "@/components/layouts";

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
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
