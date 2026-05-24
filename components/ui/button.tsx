"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

/**
 * 通用文字按钮。默认 ghost 风格（透明背景，文本色为 --text-primary）。
 * 后续如需 primary / outline 等变体再扩展。
 */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className = "", ...rest }, ref) {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center gap-xs px-md py-xs text-base font-normal transition-opacity hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{ color: "var(--text-primary)" }}
        {...rest}
      />
    );
  },
);
