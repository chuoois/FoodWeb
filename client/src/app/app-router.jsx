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
  StaffAuthLayout,
  ForbiddenLayout,
  ManagerStaffLayout,
  ManagerFinanceMain,
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
  CreateEmployeePage,
  ManagerHomePage,
  ManageAccount,
  ShopListApprovePage,
  ShopDetailPage,
  Forbidden,
  NotFound,
  CreateFoodPage,
  FoodListPage,
  ProfilePage,
  AccPendingManagement,
  ManagerStaffHomePage,
  OrdersList,
  MyOrderPage,
  MyOrderDetailPage,
  OwnerDashboardPage,
  CreateVoucherPage,
  VoucherListPage,
  MyProfile,
  MyAddress,
  MyChangePass,
  MyPrivate,
  ManagerFinanceDashboard,
  FinanceOrdersPage,
  FinanceRevenuePage, 
  FinanceShopsPage,
} from "@/pages";
import { MyProfileMainLayout } from "@/components/layouts/MyProfile-layout/MyProfile-main-layout";

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
        children: [
          { path: "", element: <HomePage /> },
          { path: "myorder", element: <MyOrderPage /> },
          { path: "myorder/:id", element: <MyOrderDetailPage /> },
        ],
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
          { path: "profile", element: <ProfilePage /> },
        ],
      },
      {
        path: "my-profile",
        element: <MyProfileMainLayout />,
        children: [
          { index: true, element: <MyProfile /> },
          { path: "address", element: <MyAddress /> },
          { path: "changepassword", element: <MyChangePass /> },
          { path: "privacy", element: <MyPrivate /> },
        ],
      },
      {
        path: "admin",
        element: <DashboardMainLayout />,
        children: [
          { path: "list-user", element: <AccountManagement /> },
          { path: "list-acc-pending", element: <AccPendingManagement /> },
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
          { path: "forgot-password", element: <StoreDirectorForgotPassword /> },
        ],
      },
      {
        path: "finance-manager",
        element: <ManagerFinanceMain />,
        children: [
          { path: "manager", element: <ManagerFinanceDashboard /> }, // Trang tổng quan tài chính
          { path: "orders", element: <FinanceOrdersPage /> }, // Đơn hàng hoàn thành
          { path: "revenue", element: <FinanceRevenuePage /> }, // Doanh thu cửa hàng
          { path: "shops", element: <FinanceShopsPage /> }, // Danh sách cửa hàng
        ],
      },
      {
        path: "store-director/manage",
        element: <StoreDirectorLayout />,
        children: [
          { path: "dashboard", element: <OwnerDashboardPage /> },
          { path: "create-shop", element: < CreateShopPage /> },
          { path: "create-staff", element: <CreateEmployeePage /> },
          { path: "account-staff", element: < ManageAccount /> },
          { path: "revenue", element: <div>Revenue</div> },
          { path: "approval", element: < ShopListApprovePage /> },
          { path: "shops/:shopId/detail", element: <ShopDetailPage /> },
        ],
      },
      {
        path: "manager-staff/manage",
        element: <ManagerStaffLayout />,
        children: [
          { path: "home", element: <ManagerStaffHomePage /> },
          { path: "dashboard", element: <div>Dashboard</div> },
          { path: "create-food", element: <CreateFoodPage /> },
          { path: "list-food", element: <FoodListPage /> },
          { path: "list-order", element: <OrdersList /> },
          { path: "create-voucher", element: <CreateVoucherPage /> },
          { path: "list-voucher", element: <VoucherListPage /> },
        ],
      },
      {
        path: "staff/auth",
        element: <StaffAuthLayout />,
        children: [{ path: "login", element: <StaffLogin /> }],
      },
      {
        path: "403-forbidden",
        element: <ForbiddenLayout />,
        children: [{ path: "", element: <Forbidden /> }],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
