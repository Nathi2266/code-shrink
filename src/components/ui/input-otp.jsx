import React, { createContext, useContext, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

const OTPContext = createContext(null);

export function InputOTP({ value = "", onChange, maxLength = 6, className, children, ...props }) {
  const inputRef = useRef(null);

  const contextValue = useMemo(
    () => ({
      value: String(value || ""),
      maxLength,
      onChange,
      focus: () => inputRef.current?.focus(),
    }),
    [value, maxLength, onChange]
  );

  return (
    <OTPContext.Provider value={contextValue}>
      <div className={cn("inline-flex flex-col items-center gap-3", className)} {...props}>
        <div className="flex items-center justify-center gap-2">{children}</div>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value.replace(/\D/g, "").slice(0, maxLength))}
          maxLength={maxLength}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label="One-time code"
          className="terminal-input w-0 h-0 opacity-0 absolute"
        />
      </div>
    </OTPContext.Provider>
  );
}

export function InputOTPGroup({ children }) {
  return <>{children}</>;
}

export function InputOTPSlot({ index }) {
  const ctx = useContext(OTPContext);
  const char = ctx?.value?.[index] || "";

  return (
    <button
      type="button"
      onClick={() => ctx?.focus?.()}
      className="w-11 h-12 rounded border border-neon-dark bg-black text-neon font-mono text-lg flex items-center justify-center"
    >
      {char || " "}
    </button>
  );
}
