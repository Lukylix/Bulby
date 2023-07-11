import { useContext, useMemo, useState } from "react";

import { SettingsContext } from "utils/contexts/settings";
import ResolvedIcon from "components/resolvedicon";
import ServicesGroup from "components/services/group";

const columnsMap = [
  "grid-cols-1",
  "grid-cols-1",
  "grid-cols-1 @[18rem]:grid-cols-2",
  "grid-cols-1 @[16rem]:grid-cols-2 @[24rem]:grid-cols-3",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4 @[35rem]:grid-cols-5",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4 @[35rem]:grid-cols-5 @[42rem]:grid-cols-6",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4 @[35rem]:grid-cols-5 @[42rem]:grid-cols-6 [49rem]:grid-cols-7",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4 @[35rem]:grid-cols-5 @[42rem]:grid-cols-6 [49rem]:grid-cols-7 [56rem]:grid-cols-8",
];
const headerGridClassMap = {
  "grid-cols-[auto_]": "grid-cols-auto",
  "grid-cols-[auto_1fr]": "grid-cols-[auto_1fr]",
};

function BackpackHeader({ service, group, i, setBackpackOpen, children }) {
  const { settings } = useContext(SettingsContext);

  const headerGridClass = `grid-cols-[${(settings?.backpacks?.[group]?.icon && "auto_") || ""}${
    ((service.name || service.description) && "1fr") || ""
  }]`;

  return (
    <div
      className={`flex flex-col @container ${
        (settings?.background?.image || settings?.background?.video) &&
        "bg-white/[0.5] hover:bg-white/[0.3] dark:bg-black/[0.7] dark:hover:bg-black/[0.3]"
      } h-30 p-1 w-full rounded-md font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 hover:bg-theme-300/20 dark:bg-white/5 dark:hover:bg-white/10 `}
    >
      <button
        className="cursor-pointer backdrop-blur-[4px] col-span-full relative w-fit"
        onClick={() => setBackpackOpen((prev) => (prev === false ? i : false))}
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
            <div
              className={`flex pl-1 ${
                (!service.widget && settings?.backpacks?.[group]?.icon && "pr-1") || ""
              } items-center justify-left w-10`}
            >
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
      {children}
    </div>
  );
}

export default function Backpack({ backpack, i }) {
  const { settings } = useContext(SettingsContext);
  const [backpackOpen, setBackpackOpen] = useState(false);

  const widthBackback = useMemo(() => {
    const widthRatio = settings?.backpacks?.[backpack.name]?.widthRatio?.split("/") || [1, 1];
    return widthRatio[0] / widthRatio[1];

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.backpacks?.[backpack.name]?.widthRatio]);

  return (
    <div className="cursor-pointer h-15 mb-2 relative gap-2" style={{ width: `${widthBackback * 100}%` }}>
      <BackpackHeader service={backpack} i={i} group={backpack.name} setBackpackOpen={setBackpackOpen}>
        {backpackOpen !== false && (
          <ServicesGroup
            group={backpack.name}
            services={backpack}
            layout={{
              columns: settings?.backpacks?.[backpack.name]?.columns || 2,
            }}
            isInsideBackpack
          />
        )}
      </BackpackHeader>
    </div>
  );
}
