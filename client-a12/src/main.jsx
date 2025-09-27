import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import router from "./routes/routes.jsx";
import { ReTitleProvider } from "re-title";
import AuthContext from "./contexts/AuthContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CartContext from "./contexts/CartContext.jsx";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReTitleProvider defaultTitle="Oshudh: Health at Door">
        <AuthContext>
          <CartContext>
            <RouterProvider router={router} />
          </CartContext>
        </AuthContext>
      </ReTitleProvider>
    </QueryClientProvider>
  </StrictMode>
);