import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./RootLayout";

import {
  AuthLayout,
  HomeMainLayout,
  MenuListMainLayout,
  DetailMainLayout,
  DashboardMainLayout,
  CheckOutMainLayout,
  StoreDirectorAuthLayout,
  StoreDirectorLayout,
  StaffAuthLayout
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
  StoreDirectorLogin,
  StoreDirectorRegister,
  StoreDirectorForgotPassword,
  CreateShopPage,
  StaffLogin,
  ShopListPage,
  CreateEmployeePage
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
      {
        path: "store-director",
        element: <StoreDirectorAuthLayout />,
        children: [
          { path: "login", element: <StoreDirectorLogin /> },
          { path: "register", element: <StoreDirectorRegister /> },
          { path: "forgot-password", element: < StoreDirectorForgotPassword /> }
        ],
      },
      {
        path: "store-director/manage",
        element: < StoreDirectorLayout />,
        children: [
          { path: "dashboard", element: <div>Dashboard</div> },
          { path: "create-shop", element: < CreateShopPage /> },
          { path: "create-staff", element: <CreateEmployeePage /> },
          { path: "approval", element: < ShopListPage /> },
          { path: "revenue", element: <div>Revenue</div> },
        ],
      },
      {
        path: "staff/auth",
        element: < StaffAuthLayout />,
        children: [
          { path: "login", element: <  StaffLogin /> },
        ],
      },
    ],
  },
]);