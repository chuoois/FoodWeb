import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import {
HomeLayout,
AuthLayout,



}from '@/components/layouts'


import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm

} from '@/pages'

const router = createBrowserRouter([
   {
    path: '',
    element: <HomeLayout/>,
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
        element: < ForgotPasswordForm/>,
      },
     

    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
