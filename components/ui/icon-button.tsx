"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Icon } from "@iconify/react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  iconSize?: number;
  /** 强制要求传 aria-label，因为图标按钮没有可见文本 */
  "aria-label": string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ icon, iconSize = 20, className = "", ...rest }, ref) {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center p-2xs transition-opacity hover:opacity-70 disabled:opacity-50 ${className}`}
        style={{ color: "var(--text-primary)" }}
        {...rest}
      >
        {/* 固定 20×20 槽位：不同 iconSize 下按钮尺寸一致 */}
        <span className="inline-flex w-5 h-5 items-center justify-center">
          <Icon icon={icon} width={iconSize} height={iconSize} />
        </span>
      </button>
    );
  },
);
