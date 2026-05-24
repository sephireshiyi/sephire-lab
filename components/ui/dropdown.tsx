"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { type ReactNode } from "react";

interface DropdownProps {
  /** 触发图标（iconify 字符串） */
  triggerIcon: string;
  /** 触发按钮的 aria-label */
  triggerLabel: string;
  /** 触发图标尺寸（px），默认 20 */
  triggerIconSize?: number;
  /** 触发槽位尺寸（px），默认 20。槽位 ≥ iconSize 时 icon 在槽位里居中；
   * 用于不同 iconSize 之间切换时按钮宽度不抖动，以及多 trigger 视觉对齐。*/
  triggerSlotSize?: number;
  /** 菜单对齐方向，默认 end（与触发按钮右对齐） */
  align?: "start" | "end";
  children: ReactNode;
}

/**
 * 基于 Headless UI Menu 的通用下拉菜单。
 * 由 Headless UI 自动处理：键盘导航、点击外部关闭、焦点管理、ARIA 属性。
 */
export function Dropdown({
  triggerIcon,
  triggerLabel,
  triggerIconSize = 20,
  triggerSlotSize = 20,
  align = "end",
  children,
}: DropdownProps) {
  return (
    <Menu>
      <MenuButton
        className="inline-flex items-center justify-center p-2xs transition-opacity hover:opacity-70 focus:outline-none"
        style={{ color: "var(--text-primary)" }}
        aria-label={triggerLabel}
      >
        {/* 固定槽位：切换主题时按钮宽度不抖动 */}
        <span
          className="inline-flex items-center justify-center"
          style={{ width: `${triggerSlotSize}px`, height: `${triggerSlotSize}px` }}
        >
          <Icon icon={triggerIcon} width={triggerIconSize} height={triggerIconSize} />
        </span>
      </MenuButton>
      <MenuItems
        anchor={{ to: `bottom ${align}`, gap: "0.5rem" }}
        transition
        className="z-50 min-w-[10rem] origin-top rounded border py-xs transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        }}
      >
        {children}
      </MenuItems>
    </Menu>
  );
}

interface DropdownItemProps {
  /** 可选的左侧图标 */
  icon?: string;
  /** 图标尺寸（px），默认 18。不同 iconify 图标视觉大小会有差异，可单独覆盖。 */
  iconSize?: number;
  /** 当前是否为选中项（高亮显示） */
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function DropdownItem({ icon, iconSize = 18, active = false, onClick, children }: DropdownItemProps) {
  return (
    <MenuItem>
      <button
        onClick={onClick}
        className="flex w-full items-center gap-sm px-md py-xs text-sm transition-colors data-[focus]:bg-[var(--bg-hover)] focus:outline-none"
        style={{
          color: active ? "var(--accent-color)" : "var(--text-primary)",
          fontWeight: active ? 500 : 400,
        }}
      >
        {/* 固定 20×20 槽位：所有 item 的文字 x 起点对齐，不受 iconSize 差异影响 */}
        {icon && (
          <span className="inline-flex w-5 h-5 shrink-0 items-center justify-center">
            <Icon icon={icon} width={iconSize} height={iconSize} />
          </span>
        )}
        <span>{children}</span>
      </button>
    </MenuItem>
  );
}
