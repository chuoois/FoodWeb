import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./RootLayout";

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
  AccountManagement,
  CheckOutPage,
  HistoryPage,
  FavoritePage,
  ShopManagement,
  AdminSettings,
} from "@/pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LoginForm /> },
          { path: "register", element: <RegisterForm /> },
          { path: "forgot-password", element: <ForgotPasswordForm /> },
        ],
      },
      {
        path: "",
        element: <HomeMainLayout />,
        children: [{ path: "", element: <HomePage /> }],
      },
      {
        path: "menu",
        element: <MenuListMainLayout />,
        children: [{ path: "list/:category", element: <MenuListPage /> }],
      },
      {
        path: "detail",
        element: <DetailMainLayout />,
        children: [
          { path: ":id", element: <DetailPage /> },
          { path: "history", element: <HistoryPage /> },
          { path: "favorite", element: <FavoritePage /> },
        ],
      },
      {
        path: "admin",
        element: <DashboardMainLayout />,
        children: [
          { path: "list-user", element: <AccountManagement /> },
          { path: "list-shop", element: <ShopManagement /> },
          { path: "setting", element: <AdminSettings /> },
        ],
      },
      {
        path: "checkout",
        element: <CheckOutMainLayout />,
        children: [
          { path: "", element: <CheckOutPage /> },
          { path: "product", element: <div>Đây là product page</div> },
        ],
      },
    ],
  },
]);
