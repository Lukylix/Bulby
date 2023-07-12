import { useContext, useMemo, useState } from "react";

import Status from "./status";

import { SettingsContext } from "utils/contexts/settings";
import ResolvedIcon from "components/resolvedicon";
import ServicesGroup from "components/services/group";
import useBackpackStatus from "hooks/useBackpackStatus";

const headerGridClassMap = {
  "grid-cols-[auto_]": "grid-cols-auto",
  "grid-cols-[auto_1fr]": "grid-cols-[auto_1fr]",
};

function BackpackHeader({ service, group, children }) {
  const { settings } = useContext(SettingsContext);
  const [backpackOpen, setBackpackOpen] = useState(false);

  const status = useBackpackStatus(service, group);

  const headerGridClass = `grid-cols-[${(settings?.backpacks?.[group]?.icon && "auto_") || ""}${
    ((service.name || service.description) && "1fr") || ""
  }]`;

  const widthBackback = useMemo(() => {
    const widthRatio = settings?.backpacks?.[group]?.widthRatio?.split("/") || [1, 1];
    return widthRatio[0] / widthRatio[1];

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.backpacks?.[group]?.widthRatio]);

  const propsStyleContainer = useMemo(
    () => ({
      style: {
        width: backpackOpen ? `${widthBackback * 100}%` : "calc(32px + 1rem)",
        transition: backpackOpen
          ? "max-height 300ms linear 100ms,width 100ms linear"
          : "max-height 300ms linear, width 100ms linear 300ms",
      },
    }),
    [backpackOpen, widthBackback]
  );

  const propsStyleStatus = useMemo(
    () => ({
      style: {
        transition: backpackOpen ? "opacity 0ms linear" : "opacity 300ms linear 400ms",
      },
    }),
    [backpackOpen]
  );

  return (
    <div
      className={`flex flex-col @container ${
        (settings?.background?.image || settings?.background?.video) &&
        "bg-white/[0.5] hover:bg-white/[0.3] dark:bg-black/[0.7] dark:hover:bg-black/[0.3]"
      } overflow-hidden h-min max-h-[calc(32px_+_1rem)] pt-1 pl-1 pr-1 ${
        backpackOpen && "!max-h-[80vh]"
      } backdrop-blur-[4px] rounded-md font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 hover:bg-theme-300/20 dark:bg-white/5 dark:hover:bg-white/10 `}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...propsStyleContainer}
    >
      <div className="overflow-hidden">
        <div
          className={`grid ${headerGridClassMap[headerGridClass]}  select-none ${
            (!service.widget && service.icon && "w-fit overflow-hidden") || ""
          }`}
        >
          <button
            className="block cursor-pointer col-span-full relative w-fit"
            onClick={() => setBackpackOpen((prev) => !prev)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                setBackpackOpen((prev) => !prev);
              }
            }}
            type="button"
            tabIndex={0}
          >
            <div className={`grid ${headerGridClassMap[headerGridClass]}  select-none w-fit overflow-hidden`}>
              {settings?.backpacks?.[group]?.icon && (
                <div className="flex pl-1 pr-1 items-center justify-left w-10">
                  <ResolvedIcon icon={settings?.backpacks?.[group]?.icon} />
                </div>
              )}
              <div className="w-full overflow-hidden box-border flex items-center py-2 justify-between rounded-r-md w-full whitespace-nowrap">
                <div
                  className={`w-full text-sm text-left ${
                    (service.widget || !settings?.backpacks?.[group]?.icon) &&
                    "text-ellipsis whitespace-nowrap overflow-hidden ..."
                  }`}
                >
                  <div className="max-w-full px-2">
                    {service.name}
                    <p className="text-theme-500 dark:text-theme-300 text-xs font-light">{service.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
        {children}
      </div>
      <div
        className={`flex-shrink-0 flex items-center justify-center opacity-1 cursor-pointer ${
          settings?.status?.type === "dot" || (settings?.status?.type === "dot-outline" && "p-2 absolute") || ""
        }  -top-2 -right-2 ${backpackOpen && "!opacity-0"}`}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...propsStyleStatus}
      >
        <Status status={status} />
        <span className="sr-only">View container stats</span>
      </div>
    </div>
  );
}

export default function Backpack({ backpack, i }) {
  const { settings } = useContext(SettingsContext);

  return (
    <BackpackHeader service={backpack} i={i} group={backpack.name}>
      <ServicesGroup
        group={backpack.name}
        services={backpack}
        layout={{
          columns: settings?.backpacks?.[backpack.name]?.columns || 2,
        }}
        isInsideBackpack
      />
    </BackpackHeader>
  );
}
