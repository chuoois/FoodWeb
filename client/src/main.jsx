import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import { router } from "@/app/app-router";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext"; 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoadingProvider> 
      <AuthProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <RouterProvider router={router} />
          <Toaster position="top-right" reverseOrder={false} />
        </GoogleOAuthProvider>
      </AuthProvider>
    </LoadingProvider>
  </StrictMode>
);
