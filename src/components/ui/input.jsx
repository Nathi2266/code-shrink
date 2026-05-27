import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(function Input({ className, type = "text", ...props }, ref) {
  return <input ref={ref} type={type} className={cn("terminal-input w-full rounded px-3 py-2", className)} {...props} />;
});

export default Input;
