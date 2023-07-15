import { useContext } from "react";
import useSWR from "swr";
import { t } from "i18next";

import { SettingsContext } from "utils/contexts/settings";

export default function KubernetesStatus({ service, isDot = false }) {
  const podSelectorString = service.podSelector !== undefined ? `podSelector=${service.podSelector}` : "";
  const { data, error } = useSWR(`/api/kubernetes/status/${service.namespace}/${service.app}?${podSelectorString}`);
  const { settings } = useContext(SettingsContext);

  if (error) {
    if (isDot)
      return (
        <div
          className={`h-2 w-2 bg-rose-500/80 rounded-full ${
            settings?.status?.type === "dot-outline" &&
            "!w-3 !h-3 border-solid border-2 border-theme-200 dark:border-theme-900"
          }`}
        />
      );
    return (
      <div
        className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden"
        title={t("docker.error")}
      >
        <div className="text-[8px] font-bold text-rose-500/80 uppercase">{t("docker.error")}</div>
      </div>
    );
  }

  if (data && data.status === "running") {
    if (isDot)
      return (
        <div
          className={`h-2 w-2 bg-emerald-500/80 rounded-full ${
            settings?.status?.type === "dot-outline" &&
            "!w-3 !h-3 border-solid border-2 border-theme-200 dark:border-theme-900"
          }`}
        />
      );
    return (
      <div
        className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden"
        title={data.health ?? data.status}
      >
        <div className="text-[8px] font-bold text-emerald-500/80 uppercase">{data.health ?? data.status}</div>
      </div>
    );
  }

  if (data && (data.status === "not found" || data.status === "down" || data.status === "partial")) {
    if (isDot)
      return (
        <div
          className={`h-2 w-2 bg-orange-400/80 rounded-full ${
            settings?.status?.type === "dot-outline" &&
            "!w-3 !h-3 border-solid border-2 border-theme-200 dark:border-theme-900"
          }`}
        />
      );
    return (
      <div
        className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden"
        title={data.status}
      >
        <div className="text-[8px] font-bold text-orange-400/50 dark:text-orange-400/80 uppercase">{data.status}</div>
      </div>
    );
  }
  if (isDot)
    return (
      <div
        className={`h-2 w-2 bg-theme-500/10 dark:bg-theme-900/50 rounded-full ${
          settings?.status?.type === "dot-outline" &&
          "!w-3 !h-3 border-solid border-2 border-theme-200 dark:border-theme-900"
        }`}
      />
    );

  return (
    <div className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden">
      <div className="text-[8px] font-bold text-black/20 dark:text-white/40 uppercase">{t("docker.unknown")}</div>
    </div>
  );
}
