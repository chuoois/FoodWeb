import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import {
  HomeLayout,
  AuthLayout,
  MenuListLayout,
  FoodDetail,
  Staff,


} from '@/components/layouts'


import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  MenuListPage

} from '@/pages'

const router = createBrowserRouter([
  {
    path: '',
    element: <HomeLayout />,
  },

  {
    path: 'auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginForm />,
      },
      {
        path: 'register',
        element: <RegisterForm />,
      },
      {
        path: 'forgot-password',
        element: < ForgotPasswordForm />,
      },


    ],
  },
  {
    path: 'menu',
    element: <MenuListLayout />,
    children: [
      {
        path: 'list/:category',
        element: <MenuListPage />,
      }
    ],
  },
  {
    path: 'detail/:id',   // 👈 route detail, nhận param id
    element: <FoodDetail />,
  },
  {
    path: 'staff',   // 👈 route detail, nhận param id
    element: <Staff />,
  },

]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
