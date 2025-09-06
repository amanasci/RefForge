"use client";

import * as React from "react";
import { getSettings, onSettingsUpdate } from "@/lib/settings";

const applyTheme = (theme: string) => {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
};

export function ThemeManager() {
  React.useEffect(() => {
    // Apply theme on initial load
    getSettings().then(settings => {
      if (settings) {
        applyTheme(settings.theme);
      }
    });

    // Listen for changes from other windows (e.g., preferences page)
    const unlisten = onSettingsUpdate(settings => {
      applyTheme(settings.theme);
    });

    // Listen for system theme changes if theme is "system"
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        getSettings().then(settings => {
            if (settings && settings.theme === 'system') {
                applyTheme('system');
            }
        });
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      unlisten.then(f => f());
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return null; // This is a side-effect component, it doesn't render anything
}
