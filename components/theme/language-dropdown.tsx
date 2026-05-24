"use client";

import { useState } from "react";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";

/**
 * 语言切换占位组件：当前仅记录本地选中状态，未接入 i18n 系统。
 * 后续接入 next-intl 或类似方案时，把 setCurrent 替换为路由切换逻辑。
 */
const languages = [
  { id: "zh", label: "中文" },
  { id: "en", label: "English" },
];

/** Trigger icon 比基准（20）放大的倍数，与 ThemeDropdown 保持一致 */
const TRIGGER_ICON_SIZE = 30;
const TRIGGER_SLOT = 30;

export function LanguageDropdown() {
  const [current, setCurrent] = useState("zh");

  return (
    <Dropdown
      triggerIcon="material-symbols-light:language"
      triggerIconSize={TRIGGER_ICON_SIZE}
      triggerSlotSize={TRIGGER_SLOT}
      triggerLabel="Change language"
    >
      {languages.map((lang) => (
        <DropdownItem
          key={lang.id}
          active={current === lang.id}
          onClick={() => setCurrent(lang.id)}
        >
          {lang.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
