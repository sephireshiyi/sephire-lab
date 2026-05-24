"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";

/**
 * 各主题的图标和尺寸。item 用原 iconSize；trigger 用 iconSize × TRIGGER_SCALE。
 * 不同 iconify 图标视觉大小不一致，sun/moon/book 需按"视觉等大"原则手动调 iconSize。
 */
const themes = [
  { id: "light", label: "Light", icon: "solar:sun-broken", iconSize: 20 },
  { id: "dark", label: "Dark", icon: "solar:moon-broken", iconSize: 17 },
  { id: "reader", label: "Reader", icon: "material-symbols-light:book-4-outline-rounded", iconSize: 20 },
];

/** Trigger 比 item 放大的倍数（让 trigger 在 header 中更醒目） */
const TRIGGER_SCALE = 1.5;
/** Trigger 槽位尺寸：覆盖所有 trigger icon 的最大尺寸 */
const TRIGGER_SLOT = Math.max(...themes.map((t) => t.iconSize)) * TRIGGER_SCALE;

export function ThemeDropdown() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const current = themes.find((t) => t.id === theme) ?? themes[0];

  return (
    <Dropdown
      triggerIcon={current.icon}
      triggerIconSize={current.iconSize * TRIGGER_SCALE}
      triggerSlotSize={TRIGGER_SLOT}
      triggerLabel="Change theme"
    >
      {themes.map((t) => (
        <DropdownItem
          key={t.id}
          icon={t.icon}
          iconSize={t.iconSize}
          active={theme === t.id}
          onClick={() => setTheme(t.id)}
        >
          {t.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
