"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type SiteChromeContextValue = {
  headerHidden: boolean;
  hideHeader: (reason: string) => void;
  showHeader: (reason: string) => void;
  revealHeader: () => void;
};

const SiteChromeContext = createContext<SiteChromeContextValue | null>(null);

export function SiteChromeProvider({ children }: { children: ReactNode }) {
  const [hiddenReasons, setHiddenReasons] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const hideHeader = useCallback((reason: string) => {
    setHiddenReasons((current) => {
      if (current.has(reason)) {
        return current;
      }

      const next = new Set(current);
      next.add(reason);
      return next;
    });
  }, []);

  const showHeader = useCallback((reason: string) => {
    setHiddenReasons((current) => {
      if (!current.has(reason)) {
        return current;
      }

      const next = new Set(current);
      next.delete(reason);
      return next;
    });
  }, []);

  const revealHeader = useCallback(() => {
    setHiddenReasons((current) =>
      current.size === 0 ? current : new Set<string>(),
    );
  }, []);

  const value = useMemo(
    () => ({
      headerHidden: hiddenReasons.size > 0,
      hideHeader,
      showHeader,
      revealHeader,
    }),
    [hiddenReasons, hideHeader, showHeader, revealHeader],
  );

  return (
    <SiteChromeContext.Provider value={value}>
      {children}
    </SiteChromeContext.Provider>
  );
}

export function useSiteChrome() {
  const context = useContext(SiteChromeContext);

  if (!context) {
    throw new Error("useSiteChrome must be used within SiteChromeProvider");
  }

  return context;
}
