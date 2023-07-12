import classNames from "classnames";
import { Disclosure, Transition } from "@headlessui/react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useContext } from "react";

import List from "components/services/list";
import ResolvedIcon from "components/resolvedicon";
import { SettingsContext } from "utils/contexts/settings";

export default function ServicesGroup({ group, services, layout, isInsideBackpack = false }) {
  const { settings } = useContext(SettingsContext);
  return (
    <div
      key={services.name}
      className={`flex-1 p-1 @container ${
        (layout?.style === "row" || layout?.style === "auto-row" || layout?.style === "auto-row-center") &&
        "col-span-full w-full"
      }`}
    >
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button
              disabled={settings.disableCollapse || Number.isInteger(parseInt(services.name, 10))}
              className="flex w-full select-none items-center group"
            >
              {layout?.icon && (
                <div className="flex-shrink-0 mr-2 w-7 h-7">
                  <ResolvedIcon icon={layout.icon} />
                </div>
              )}
              {Number.isNaN(parseInt(services.name, 10)) && !isInsideBackpack && (
                <h2 className="flex text-theme-800 dark:text-theme-300 text-xl font-medium">{services.name}</h2>
              )}
              {Number.isNaN(parseInt(services.name, 10)) && !isInsideBackpack && (
                <MdKeyboardArrowDown
                  className={classNames(
                    settings.disableCollapse ? "hidden" : "",
                    "transition-opacity opacity-0 group-hover:opacity-100 ml-auto text-theme-800 dark:text-theme-300 text-xl",
                    open ? "rotate-180 transform" : ""
                  )}
                />
              )}
            </Disclosure.Button>
            <Transition
              enter="transition duration-200 ease-out"
              enterFrom="transform scale-75 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-75 opacity-0"
            >
              <Disclosure.Panel>
                <List group={group} services={services.services} layout={layout} isInsideBackpack={isInsideBackpack} />
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
}
