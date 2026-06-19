"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";

/**
 * 各主题的图标和尺寸。item 用原 iconSize；trigger 用 iconSize × TRIGGER_SCALE。
 * 不同 iconify 图标视觉大小不一致，sun/moon 需按"视觉等大"原则手动调 iconSize。
 *
 * 全站主题只暴露 light / dark；reader 不再作为全局主题（已从下拉中移除，
 * .reader 的 CSS 与 logo 变体仍保留，预留给未来「Writing 阅读场景」专项任务）。
 */
const themes = [
  { id: "light", label: "Light", icon: "solar:sun-broken", iconSize: 20 },
  { id: "dark", label: "Dark", icon: "solar:moon-broken", iconSize: 17 },
];

/**
 * 是否已在客户端挂载。用 useSyncExternalStore 实现：服务端快照返回 false，
 * 客户端返回 true——既避免「在 effect 里同步 setState」触发的级联渲染
 * （react-hooks/set-state-in-effect），又能防止 theme 相关图标的水合不匹配。
 */
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/** Trigger 比 item 放大的倍数（让 trigger 在 header 中更醒目） */
const TRIGGER_SCALE = 1.5;
/** Trigger 槽位尺寸：覆盖所有 trigger icon 的最大尺寸 */
const TRIGGER_SLOT = Math.max(...themes.map((t) => t.iconSize)) * TRIGGER_SCALE;

export function ThemeDropdown() {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

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
