import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-center"
      expand={true}
      visibleToasts={2}
      richColors
      duration={3000}
      toastOptions={{
        classNames: {
          success: "!bg-blue-500 !text-white !border-blue-600",
          error: "!bg-red-500 !text-white !border-red-600",
          info: "!bg-blue-400 !text-white",
          description:
            "group-[.success]:text-blue-100 group-[.error]:text-red-100",
        },
      }}
    />
  </StrictMode>,
);
