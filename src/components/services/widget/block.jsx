import { useContext } from "react";
import { useTranslation } from "next-i18next";
import classNames from "classnames";

import { SettingsContext } from "utils/contexts/settings";

export default function Block({ value, label }) {
  const { t } = useTranslation();
  const { settings } = useContext(SettingsContext);
  return (
    <div
      className={classNames(
        "bg-theme-200/50 dark:bg-theme-900/40 rounded flex flex-col items-center justify-center text-center p-1",
        value === undefined ? "animate-pulse" : "",
        (settings?.background?.image || settings?.background?.video) && "dark:bg-theme-900/60"
      )}
    >
      <div className="font-thin text-sm">{value === undefined || value === null ? "-" : value}</div>
      <div className="font-bold text-xs uppercase">{t(label)}</div>
    </div>
  );
}
