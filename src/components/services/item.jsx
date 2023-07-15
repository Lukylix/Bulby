import classNames from "classnames";
import { useContext, useState } from "react";

import Status from "./status";
import Widget from "./widget";
import Ping from "./ping";
import KubernetesStatus from "./kubernetes-status";

import Docker from "widgets/docker/component";
import Kubernetes from "widgets/kubernetes/component";
import { SettingsContext } from "utils/contexts/settings";
import ResolvedIcon from "components/resolvedicon";

export default function Item({ service, group, isInsideBackpack = false }) {
  const hasLink = service.href && service.href !== "#";
  const { settings } = useContext(SettingsContext);
  const showStats = service.showStats === false ? false : settings.showStats;
  const [statsOpen, setStatsOpen] = useState(service.showStats);
  const [statsClosing, setStatsClosing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // set stats to closed after 300ms
  const closeStats = () => {
    if (statsOpen) {
      setStatsClosing(true);
      setTimeout(() => {
        setStatsOpen(false);
        setStatsClosing(false);
      }, 300);
    }
  };

  const headerGridClass = `grid-cols-[${(service.icon && "auto_") || ""}${
    ((service.name || service.description) && "1fr") || ""
  }]`;

  const headerGridClassMap = {
    "grid-cols-[auto_]": "grid-cols-auto",
    "grid-cols-[auto_1fr]": "grid-cols-[auto_1fr]",
  };

  return (
    <li
      key={service.name}
      className={`${(settings?.layout?.[group]?.style?.includes("auto-row") && "w-fit") || ""} h-min`}
    >
      <div
        className={`${hasLink ? "cursor-pointer " : " "} backdrop-blur-[4px] ${
          (settings?.background?.image || settings?.background?.video) &&
          !isInsideBackpack &&
          "bg-white/[0.5] hover:bg-white/[0.3] dark:bg-black/[0.7] dark:hover:bg-black/[0.3]"
        } ${
          isInsideBackpack
            ? "bg-theme-200/50 dark:bg-theme-900/70 hover:bg-theme-200/30 dark:hover:bg-theme-900/30"
            : "dark:text-theme-200 dark:hover:text-theme-300 bg-theme-100/20 hover:bg-theme-300/20 dark:bg-white/5 dark:hover:bg-white/10"
        } h-15 p-1 rounded-md font-medium text-theme-100 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 relative ${
          settings?.layout?.[group]?.style?.includes("auto-row") && "w-fit"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`grid ${headerGridClassMap[headerGridClass]}  select-none ${
            (settings?.layout?.[group]?.style?.includes("auto-row") && "w-fit overflow-hidden") || ""
          }`}
        >
          {service.icon &&
            (hasLink ? (
              <a
                href={service.href}
                target={service.target ?? settings.target ?? "_blank"}
                rel="noreferrer"
                className={`flex pl-1 ${
                  (settings?.layout?.[group]?.style?.includes("auto-row") && "pr-1") || ""
                } items-center justify-left w-10`}
              >
                <ResolvedIcon icon={service.icon} />
              </a>
            ) : (
              <div className="flex pl-1 items-center  justify-left w-8 ">
                <ResolvedIcon icon={service.icon} />
              </div>
            ))}

          {hasLink ? (
            <a
              href={service.href}
              target={service.target ?? settings.target ?? "_blank"}
              rel="noreferrer"
              className={`${
                !settings?.layout?.[group]?.style?.includes("auto") && "w-full overflow-hidden"
              } box-border flex items-center py-2 justify-between rounded-r-md w-full whitespace-nowrap`}
            >
              <div
                className={`max-w-2xl w-auto duration-500 text-sm text-left ease-linear transition-all text-ellipsis whitespace-nowrap overflow-hidden ... ${
                  settings?.layout?.[group]?.style?.includes("auto") && "max-w-[0]"
                }`}
              >
                <div className="max-w-full px-2">
                  {service.name}

                  <p className="text-theme-500 dark:text-theme-300 text-xs font-light">{service.description}</p>
                </div>
              </div>
            </a>
          ) : (
            <div className="flex-1 py-2 flex">
              <div
                className={`${
                  (service.widget || !service.icon) && "w-full"
                } flex items-center justify-between rounded-r-md px-0`}
              >
                <div
                  className={`max-w-2xl w-auto duration-500 text-sm text-left ease-linear transition-all ${
                    (service.widget || !service.icon) && "text-ellipsis whitespace-nowrap overflow-hidden ..."
                  } ${!isHovered && settings?.layout?.[group]?.style?.includes("auto-row") && "!max-w-[0]"}`}
                >
                  <div className="max-w-full px-2">
                    {service.name}
                    <p className="text-theme-500 dark:text-theme-300 text-xs font-light">{service.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-0 right-0 flex flex-row justify-end gap-2 mr-2 z-10">
            {service.ping && (
              <div className="flex-shrink-0 flex items-center justify-center cursor-pointer">
                <Ping group={group} service={service.name} />
                <span className="sr-only">Ping status</span>
              </div>
            )}

            {service.container && (
              <button
                type="button"
                onClick={() => (statsOpen ? closeStats() : setStatsOpen(true))}
                className={`flex-shrink-0 flex items-center justify-center cursor-pointer ${
                  ((settings?.status?.type === "dot" ||
                    settings?.status?.type === "dot-outline" ||
                    settings?.layout?.[group]?.style?.includes("auto-row")) &&
                    "p-2 absolute") ||
                  ""
                } ${!settings?.layout?.[group]?.style?.includes("auto-row") && "-top-0.5 -right-2.5"} ${
                  settings?.layout?.[group]?.style?.includes("auto-row") && "-top-2 -right-4"
                }`}
              >
                <Status
                  service={service}
                  isDot={
                    settings?.status?.type === "dot" ||
                    settings?.status?.type === "dot-outline" ||
                    settings?.layout?.[group]?.style?.includes("auto-row")
                  }
                />
                <span className="sr-only">View container stats</span>
              </button>
            )}
            {service.app && !service.external && (
              <button
                type="button"
                onClick={() => (statsOpen ? closeStats() : setStatsOpen(true))}
                className="flex-shrink-0 flex items-center justify-center cursor-pointer"
              >
                <KubernetesStatus service={service} />
                <span className="sr-only">View container stats</span>
              </button>
            )}
          </div>
        </div>

        {service.container && service.server && (
          <div
            className={classNames(
              showStats || (statsOpen && !statsClosing) ? "max-h-[110px] opacity-100" : " max-h-[0] opacity-0",
              "w-full overflow-hidden transition-all duration-300 ease-in-out"
            )}
          >
            {(showStats || statsOpen) && (
              <Docker service={{ widget: { container: service.container, server: service.server } }} />
            )}
          </div>
        )}
        {service.app && (
          <div
            className={classNames(
              showStats || (statsOpen && !statsClosing) ? "max-h-[55px] opacity-100" : " max-h-[0] opacity-0",
              "w-full overflow-hidden transition-all duration-300 ease-in-out"
            )}
          >
            {(showStats || statsOpen) && (
              <Kubernetes
                service={{
                  widget: { namespace: service.namespace, app: service.app, podSelector: service.podSelector },
                }}
              />
            )}
          </div>
        )}

        {service.widget && <Widget service={service} />}
      </div>
    </li>
  );
}
