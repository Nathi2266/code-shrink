import React from "react";
import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#000",
          color: "#00FF41",
          border: "1px solid rgba(0,255,65,0.3)",
          fontFamily: "Fira Code, monospace",
        },
      }}
    />
  );
}

export default Toaster;
