import React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }) {
  return <label className={cn("block text-neon-dim text-sm", className)} {...props} />;
}

export default Label;
