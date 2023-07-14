import { useContext, useEffect, useMemo, useState } from "react";

import Status from "./status";

import { SettingsContext } from "utils/contexts/settings";
import ResolvedIcon from "components/resolvedicon";
import ServicesGroup from "components/services/group";
import useBackpackStatus from "hooks/useBackpackStatus";

const headerGridClassMap = {
  "grid-cols-[auto_]": "grid-cols-auto",
  "grid-cols-[auto_1fr]": "grid-cols-[auto_1fr]",
};

function BackpackHeader({ service, group, children, containerWidth, serviceGroupsLength = 0, backpacksLength = 0 }) {
  const { settings } = useContext(SettingsContext);
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [initialcontainerWidth, setInitialContainerWidth] = useState(containerWidth);

  useEffect(() => {
    if (initialcontainerWidth === 0 || initialcontainerWidth < containerWidth) setInitialContainerWidth(containerWidth);
  }, [containerWidth, initialcontainerWidth]);

  const status = useBackpackStatus(service.services, group);

  const headerGridClass = `grid-cols-[${(settings?.backpacks?.[group]?.icon && "auto_") || ""}${
    ((service.name || service.description) && "1fr") || ""
  }]`;

  const widthBacpackRatio = useMemo(() => {
    const widthRatio = settings?.backpacks?.[group]?.widthRatio?.split("/") || [1, 1];

    if (initialcontainerWidth > 800) return widthRatio[0] / widthRatio[1];
    if (initialcontainerWidth > 600) return widthRatio[0] / widthRatio[1] > 0.5 ? widthRatio[0] / widthRatio[1] : 0.5;
    return 1;
  }, [settings?.backpacks, group, initialcontainerWidth]);

  const gapsBackpack = useMemo(
    () => (backpacksLength > serviceGroupsLength ? backpacksLength - 1 : serviceGroupsLength - 1),
    [backpacksLength, serviceGroupsLength]
  );

  const gapsBackpackWidth = useMemo(() => {
    if (containerWidth > 800) return gapsBackpack * (0.5 * 16) + 1;
    if (containerWidth > 600) return 0.5 * 16 + 1;
    return 0;
  }, [containerWidth, gapsBackpack]);

  const desiredWidth = useMemo(() => {
    if (!backpackOpen) return "calc(32px + 1rem)";
    if (containerWidth > 600)
      return widthBacpackRatio > 0.5
        ? `${(initialcontainerWidth - gapsBackpackWidth) * widthBacpackRatio}px`
        : `calc(50% - ${gapsBackpackWidth / backpacksLength}px)`;
    return "100%";
  }, [backpackOpen, containerWidth, initialcontainerWidth, gapsBackpackWidth, widthBacpackRatio, backpacksLength]);

  const propsStyleContainer = useMemo(
    () => ({
      style: {
        width: desiredWidth,
        maxWidth:
          desiredWidth === "100%" ? "100%" : `${(initialcontainerWidth - gapsBackpackWidth) * widthBacpackRatio}px`,
        transition: backpackOpen
          ? "max-height 300ms linear 100ms,width 100ms linear"
          : "max-height 300ms linear, width 100ms linear 300ms",
      },
    }),
    [backpackOpen, desiredWidth, initialcontainerWidth, gapsBackpackWidth, widthBacpackRatio]
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
      } overflow-hidden h-min max-h-[calc(32px_+_1rem)] max-w-full p-1 ${
        backpackOpen && "!max-h-max	"
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
        className={`flex-shrink-0 flex items-center justify-center opacity-1 cursor-pointer p-2 absolute -top-2 -right-2 ${
          backpackOpen && "!opacity-0"
        }`}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...propsStyleStatus}
      >
        <Status status={status} />
        <span className="sr-only">View container stats</span>
      </div>
    </div>
  );
}

export default function Backpack({ backpack, i, serviceGroupsLength, backpacksLength, containerWidth }) {
  const { settings } = useContext(SettingsContext);

  return (
    <BackpackHeader
      service={backpack}
      i={i}
      group={backpack.name}
      serviceGroupsLength={serviceGroupsLength}
      backpacksLength={backpacksLength}
      containerWidth={containerWidth}
    >
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
