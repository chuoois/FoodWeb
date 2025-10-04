import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  AuthLayout,
  HomeMainLayout,
  DetailMainLayout,
  DashboardMainLayout,
  CheckOutMainLayout
  
} from "@/components/layouts";

import {
  HomePage,
  DetailPage,
  AdminPage,
  CheckOutPage,
  HistoryPage,
  FavoritePage
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
  {
    path: "detail",
    element: <DetailMainLayout />,
    children: [
      {
        path: "",
        element: <DetailPage/>,
      },
      {
        path: "history",
        element: <HistoryPage/>,
      },
      {
        path: "favorite",
        element: <FavoritePage/>,
      },
    ],
  },
  {
    path: "dashboard",
    element: <DashboardMainLayout />,
    children: [
      {
        path: "admin",
        element: <AdminPage/>,
      },
      {
        path: "product",
        element: <div>Đây là product page</div>,
      },
    ],
  },
  {
    path: "checkout",
    element: <CheckOutMainLayout />,
    children: [
      {
        path: "",
        element: <CheckOutPage/>,
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
