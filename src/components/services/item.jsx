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

export default function Item({ service, group }) {
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

  return (
    <li key={service.name} className={`${(!service.widget && service.icon && "w-fit") || ""}`}>
      <div
        className={`${
          hasLink ? "cursor-pointer " : " "
        }transition-all h-15 mb-2 p-1 rounded-md font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 hover:bg-theme-300/20 dark:bg-white/5 dark:hover:bg-white/10 relative ${
          !service.widget && service.icon && "w-fit"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`grid grid-cols-[${(service.icon && "auto_") || ""}1fr] select-none ${
            (!service.widget && service.icon && "w-fit overflow-hidden transition-all") || ""
          }`}
        >
          {service.icon &&
            (hasLink ? (
              <a
                href={service.href}
                target={service.target ?? settings.target ?? "_blank"}
                rel="noreferrer"
                className={`flex pl-1 ${
                  (!service.widget && service.icon && "pr-1") || ""
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
                (service.widget || !service.icon) && "w-full overflow-hidden"
              } box-border flex items-center py-2 justify-between rounded-r-md w-full whitespace-nowrap transition-all ${
                (service.widget || !service.icon) && "px-2"
              } ${(!service.widget && service.icon && isHovered && "!px-2") || ""}`}
            >
              <div
                className={`max-w-full text-sm text-left transition-all ${
                  (service.widget || !service.icon) && "text-ellipsis whitespace-nowrap overflow-hidden ..."
                }   ${!isHovered && !service.widget && service.icon && "!max-w-0 "}`}
              >
                {service.name}

                <p className="text-theme-500 dark:text-theme-300 text-xs font-light">{service.description}</p>
              </div>
            </a>
          ) : (
            <div className="flex-1 py-2 flex">
              <div
                className={`${
                  (service.widget || !service.icon) && "w-full"
                } flex items-center justify-between rounded-r-md transition-all ${
                  (service.widget || !service.icon) && "px-2"
                } ${(!service.widget && service.icon && isHovered && "!px2") || ""}`}
              >
                <div
                  className={`max-w-full text-sm text-left  transition-all ${
                    (service.widget || !service.icon) && "text-ellipsis whitespace-nowrap overflow-hidden ..."
                  } ${!isHovered && !service.widget && service.icon && "!max-w-0"}`}
                >
                  {service.name}
                  <p className="text-theme-500 dark:text-theme-300 text-xs font-light">{service.description}</p>
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
                  (settings?.status?.type === "dot" && "p-2 absolute") || ""
                } ${(service.widget || !service.icon) && "-top-0.5 -right-2.5"} ${
                  !service.widget && service.icon && "-top-2 -right-4"
                }`}
              >
                <Status service={service} />
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
