import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "neon-btn",
  outline: "neon-btn-secondary",
};

export const Button = React.forwardRef(function Button(
  { className, variant = "default", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(variants[variant] || variants.default, className)}
      {...props}
    />
  );
});

export default Button;
