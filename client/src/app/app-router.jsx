import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  AuthLayout,
  HomeMainLayout,
  MenuListMainLayout,
  DetailMainLayout,
  DashboardMainLayout,
  CheckOutMainLayout
  

} from "@/components/layouts";

import {
  HomePage,
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  MenuListPage,
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
        element: <LoginForm/>,
      },
      {
        path: "register",
        element: <RegisterForm/>,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordForm/>,
      }
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
    path: "detail/:id",
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
