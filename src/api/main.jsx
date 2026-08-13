import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";
import { router } from "./router";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      {/* Ajout de la prop `future` pour activer les nouvelles fonctionnalités et supprimer les avertissements */}
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      />
    </AuthProvider>
    <Toaster />
  </React.StrictMode>
);