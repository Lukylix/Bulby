import { useContext } from "react";
import { SettingsContext } from "utils/contexts/settings";

export default function Status({ status }) {
  const { settings } = useContext(SettingsContext);
  if (status === "error" || !status) {
    <div
      className={`w-2 h-2 ${
        settings?.status?.type === "dot-outline" &&
        "!w-3 !h-3 border-solid border-2 border-theme-200 dark:border-theme-900"
      } bg-theme-500/10 dark:bg-theme-900 rounded-full `}
    />;
  }

  if (status?.includes("running")) {
    return (
      <div
        className={`w-2 h-2 ${
          settings?.status?.type === "dot-outline" &&
          "!w-3 !h-3 border-solid border-2 border-theme-200 dark:border-theme-900"
        } bg-theme-500/10 dark:bg-theme-900 rounded-full`}
      />
    );
  }

  if (status === "unhealthy") {
    return (
      <div
        className={`w-2 h-2 ${
          settings?.status?.type === "dot-outline" &&
          "!w-3 !h-3 border-solid border-2 border-theme-200 dark:border-theme-900"
        } bg-rose-500/80 rounded-full `}
      />
    );
  }
  if (status === "healthy" || status === "running" || status === "ok") {
    return (
      <div
        className={`w-2 h-2 ${
          settings?.status?.type === "dot-outline" &&
          "!w-3 !h-3 border-solid border-2 border-theme-200 dark:border-theme-900"
        } bg-emerald-500 rounded-full`}
      />
    );
  }

  if (status === "not found" || status === "exited" || status?.startsWith("partial")) {
    return (
      <div
        className={`w-2 h-2 ${
          settings?.status?.type === "dot-outline" &&
          "!w-3 !h-3 border-solid border-2 border-theme-200 dark:border-theme-900"
        } bg-rose-500/80 rounded-full`}
      />
    );
  }

  return (
    <div
      className={`w-2 h-2 ${
        settings?.status?.type === "dot-outline" &&
        "!w-3 !h-3 border-solid border-2 border-theme-200 dark:border-theme-900"
      } bg-theme-500/10 dark:bg-theme-900 rounded-full`}
    />
  );
}
