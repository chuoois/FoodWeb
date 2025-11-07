import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import { router } from "@/app/app-router";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext"; 
import { ChatAI } from "./pages";

createRoot(document.getElementById("root")).render(
    <LoadingProvider> 
      <AuthProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <RouterProvider router={router} />
          <ChatAI />
          <Toaster position="top-right" reverseOrder={false} />
        </GoogleOAuthProvider>
      </AuthProvider>
    </LoadingProvider>
);
