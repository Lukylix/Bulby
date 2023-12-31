import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { useContext } from "react";

import { SettingsContext } from "../../utils/contexts/settings";

export default function Status({ service, isDot = false }) {
  const { t } = useTranslation();
  const { settings } = useContext(SettingsContext);

  const { data, error } = useSWR(`/api/docker/status/${service.container}/${service.server || ""}`);

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
    <div
      className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden"
      title={t("docker.error")}
    >
      <div className="text-[8px] font-bold text-rose-500/80 uppercase">{t("docker.error")}</div>
    </div>;
  }

  if (data) {
    let statusLabel = "";

    if (data.status?.includes("running")) {
      if (data.health === "starting") {
        if (isDot)
          return (
            <div
              className={`h-2 w-2 bg-blue-500/80 rounded-full ${
                settings?.status?.type === "dot-outline" &&
                "!w-3 !h-3 border-solid border-2 border-theme-200 dark:border-theme-900"
              }`}
            />
          );
        return (
          <div
            className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden"
            title={t("docker.starting")}
          >
            <div className="text-[8px] font-bold text-blue-500/80 uppercase">{t("docker.starting")}</div>
          </div>
        );
      }

      if (data.health === "unhealthy") {
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
            title={t("docker.unhealthy")}
          >
            <div className="text-[8px] font-bold text-orange-400/50 dark:text-orange-400/80 uppercase">
              {t("docker.unhealthy")}
            </div>
          </div>
        );
      }

      if (!data.health) {
        statusLabel = data.status.replace("running", t("docker.running"));
      } else {
        statusLabel = data.health === "healthy" ? t("docker.healthy") : data.health;
      }

      if (isDot)
        return (
          <div
            className={`h-2 w-2 bg-emerald-500 rounded-full ${
              settings?.status?.type === "dot-outline" &&
              "!w-3 !h-3 border-solid border-2 border-theme-200 dark:border-theme-900"
            }`}
          />
        );
      return (
        <div
          className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden"
          title={statusLabel}
        >
          <div className="text-[8px] font-bold text-emerald-500/80 uppercase">{statusLabel}</div>
        </div>
      );
    }

    if (data.status === "not found" || data.status === "exited" || data.status?.startsWith("partial")) {
      if (data.status === "not found") statusLabel = t("docker.not_found");
      else if (data.status === "exited") statusLabel = t("docker.exited");
      else statusLabel = data.status.replace("partial", t("docker.partial"));
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
          title={statusLabel}
        >
          <div className="text-[8px] font-bold text-orange-400/50 dark:text-orange-400/80 uppercase">{statusLabel}</div>
        </div>
      );
    }
  }
  if (isDot)
    return (
      <div
        className={`w-2 h-2 bg-theme-500/10 dark:bg-theme-900 rounded-full ${
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
