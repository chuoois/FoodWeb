import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import {
  HomeLayout,
  AuthLayout,
  MenuListLayout



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
    element: <MenuListLayout/>,
    children:[
      {
        path: 'list/:category',
        element: <MenuListPage/>,
      }
    ]
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
